import { defineCommandMenuItem } from 'twenty-sdk/define';
import { MEDIA_NOTES_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '../components/media-notes.front-component';

export default defineCommandMenuItem({
  universalIdentifier: '83d9d1ba-b042-41c1-94e8-892931d8663f',
  label: 'Record media note',
  shortLabel: 'Media note',
  icon: 'IconMicrophone',
  isPinned: true,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    MEDIA_NOTES_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
