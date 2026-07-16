import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-sdk/define';
import { EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER } from '../objects/executive-board-service.object';

export default definePageLayout({
  universalIdentifier: '9e221c38-a0dd-4829-b208-6a8898bbd7f7',
  name: 'Board Service Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
});
