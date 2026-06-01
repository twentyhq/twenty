import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { persistVisitPhoto } from '../services/visitPhotoStore';
import { shahryarColors } from '../theme';

type VisitPhotoCaptureProps = {
  photoUris: string[];
  onPhotoCaptured: (uri: string) => void;
  onPhotoRemoved: (uri: string) => void;
};

export const VisitPhotoCapture = ({
  photoUris,
  onPhotoCaptured,
  onPhotoRemoved,
}: VisitPhotoCaptureProps) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleOpenCamera = async () => {
    if (permission?.granted !== true) {
      const requestedPermission = await requestPermission();

      if (requestedPermission.granted !== true) {
        Alert.alert(
          'مۆڵەتی کامێرا پێویستە',
          'بۆ گرتنی وێنەی سەردان، مۆڵەتی کامێرا بدە.',
        );

        return;
      }
    }

    setIsCameraOpen(true);
  };

  const handleCapturePhoto = async () => {
    if (cameraRef.current === null) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: false,
      });

      if (photo?.uri === undefined) {
        return;
      }

      const persistedPhotoUri = await persistVisitPhoto({
        capturedAt: new Date().toISOString(),
        sourceUri: photo.uri,
      });

      onPhotoCaptured(persistedPhotoUri);
    } catch {
      Alert.alert(
        'وێنە پاشەکەوت نەکرا',
        'تکایە جارێکی تر هەوڵ بدە یان ئۆفلاین درێژە بدە.',
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable onPress={handleOpenCamera} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>کردنەوەی کامێرا</Text>
        </Pressable>
        {isCameraOpen && (
          <Pressable
            disabled={isCapturing}
            onPress={() => setIsCameraOpen(false)}
            style={[styles.secondaryButton, isCapturing && styles.disabled]}
          >
            <Text style={styles.secondaryButtonText}>داخستن</Text>
          </Pressable>
        )}
      </View>

      {isCameraOpen && (
        <View style={styles.cameraFrame}>
          <CameraView
            facing="back"
            mode="picture"
            ref={cameraRef}
            style={styles.camera}
          />
          <Pressable
            disabled={isCapturing}
            onPress={handleCapturePhoto}
            style={[styles.captureButton, isCapturing && styles.disabled]}
          >
            <Text style={styles.captureButtonText}>
              {isCapturing ? 'پاشەکەوت...' : 'گرتنی وێنە'}
            </Text>
          </Pressable>
        </View>
      )}

      {photoUris.length > 0 && (
        <View style={styles.photoGrid}>
          {photoUris.map((uri) => (
            <View key={uri} style={styles.photoTile}>
              <Image source={{ uri }} style={styles.photoThumbnail} />
              <Pressable
                onPress={() => onPhotoRemoved(uri)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>سڕینەوە</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: shahryarColors.blue,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: shahryarColors.blue,
    fontSize: 14,
    fontWeight: '700',
  },
  cameraFrame: {
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  camera: {
    aspectRatio: 3 / 4,
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: shahryarColors.red,
    minHeight: 44,
    justifyContent: 'center',
  },
  captureButtonText: {
    color: shahryarColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  photoGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoTile: {
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: 104,
  },
  photoThumbnail: {
    aspectRatio: 1,
    backgroundColor: shahryarColors.surface,
    width: '100%',
  },
  removeButton: {
    alignItems: 'center',
    minHeight: 34,
    justifyContent: 'center',
  },
  removeButtonText: {
    color: shahryarColors.red,
    fontSize: 12,
    fontWeight: '700',
  },
});
