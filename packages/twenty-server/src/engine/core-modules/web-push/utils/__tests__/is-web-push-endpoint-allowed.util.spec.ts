import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';

describe('isWebPushEndpointAllowed', () => {
  it.each([
    'https://fcm.googleapis.com/fcm/send/abc123',
    'https://fcm.googleapis.com/wp/abc123',
    'https://wns2-par02p.notify.windows.com/w/?token=abc',
    'https://updates.push.services.mozilla.com/wpush/v2/abc',
    'https://web.push.apple.com/abc',
  ])('should allow the push service endpoint %s', (endpoint) => {
    expect(isWebPushEndpointAllowed(endpoint)).toBe(true);
  });

  it.each([
    'http://fcm.googleapis.com/fcm/send/abc123',
    'https://fcm.googleapis.com:8443/fcm/send/abc123',
    'https://fcm.googleapis.com.example.com/fcm/send/abc123',
    'https://evilnotify.windows.com/w/?token=abc',
    'https://wns2-par02p.notify.windows.com./w/?token=abc',
    'https://fcm.googleapis.com/v1/projects/abc/messages:send',
    'https://updates.push.services.mozilla.com/admin',
    'https://wns2-par02p.notify.windows.com/other?token=abc',
    'https://user:password@fcm.googleapis.com/fcm/send/abc123',
    'https://fcm.googleapis.com/fcm/send/abc123#fragment',
    'https://10.0.0.5/admin',
    'not a url',
  ])('should refuse %s', (endpoint) => {
    expect(isWebPushEndpointAllowed(endpoint)).toBe(false);
  });
});
