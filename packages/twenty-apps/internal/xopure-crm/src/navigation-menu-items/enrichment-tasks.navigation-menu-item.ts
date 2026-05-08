import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';

export default defineNavigationMenuItem({ universalIdentifier: 'be5d336f-c8a1-446b-a3eb-a765ddad8362', position: 31, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID });
