import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ShahryarNotificationPlatform = 'android' | 'ios';

export type ShahryarDevicePermissionState = {
  cameraGranted: boolean;
  locationGranted: boolean;
  notificationsGranted: boolean;
};

export const requestShahryarDevicePermissions =
  async (): Promise<ShahryarDevicePermissionState> => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('shahryar-alerts', {
        name: 'Shahryar OPS alerts',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const [cameraPermission, locationPermission, notificationPermission] =
      await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        Location.requestForegroundPermissionsAsync(),
        Notifications.requestPermissionsAsync(),
      ]);

    return {
      cameraGranted: cameraPermission.status === 'granted',
      locationGranted: locationPermission.status === 'granted',
      notificationsGranted: notificationPermission.status === 'granted',
    };
  };

export const getCurrentGpsLocation = async () => {
  const position = await Location.getCurrentPositionAsync({});

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

export const getShahryarNotificationPlatform = ():
  | ShahryarNotificationPlatform
  | undefined => {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return Platform.OS;
  }

  return undefined;
};

export const getShahryarExpoPushToken = async (): Promise<
  string | undefined
> => {
  try {
    return (await Notifications.getExpoPushTokenAsync()).data;
  } catch {
    return undefined;
  }
};
