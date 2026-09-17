import { defineLogicFunction } from 'twenty-sdk/define';
import { desktopCompanionHandler } from 'src/logic-functions/utils/desktopCompanionHandler';

export default defineLogicFunction({
  universalIdentifier: '4ca4fc91-70f8-4bee-84f2-558053b1224a',
  name: 'desktop-companion',
  description:
    'Authenticated personal agenda and Recall desktop upload provisioning for Desktop Recorder.',
  timeoutSeconds: 60,
  handler: desktopCompanionHandler,
  httpRouteTriggerSettings: {
    path: '/companion/desktop',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
