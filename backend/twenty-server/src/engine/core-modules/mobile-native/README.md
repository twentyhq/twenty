# Mobile Native

Mobile app support with session management, biometric authentication (fingerprint/face ID), offline queue with conflict resolution, GPS check-ins, and push notifications.

## Entities
- `MobileSessionEntity` — userId, platform (ios/android/web), appVersion, deviceModel, pushToken, biometricEnabled, offlineModeEnabled, lastLat/Lng, offlineSyncsPending
- `BiometricConfigEntity` — userId, biometricType (fingerprint/face_id/iris/pin), publicKeyHash, failedAttempts, maxFailedAttempts, isLocked, requireForPayments, requireForDataExport
- `OfflineQueueEntity` — userId, actionType (create/update/delete/sync), syncStatus (pending/syncing/synced/failed/conflict), entity data

## Service Methods
- `MobileNativeService` — registers mobile sessions, configures biometric auth, queues offline actions, syncs with conflict detection, tracks GPS check-ins, manages push token registration

## Feature Flag
N/A (core mobile module)

## Dependencies
- None
