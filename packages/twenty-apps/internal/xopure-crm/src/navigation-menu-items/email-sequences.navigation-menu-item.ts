import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EMAIL_SEQUENCE_OBJECT_ID } from '../objects/email-sequence.object';

export default defineNavigationMenuItem({ universalIdentifier: 'ba7b5067-4b26-47d0-8c82-dc3aa446ad20', position: 30, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: EMAIL_SEQUENCE_OBJECT_ID });
