import { AUTOMATION_OBJECT_NAMES_SINGULAR } from '@/navigation-menu-item/common/constants/AutomationObjectNamesSingular';

export const isAutomationObjectNameSingular = (
  nameSingular: string,
): nameSingular is (typeof AUTOMATION_OBJECT_NAMES_SINGULAR)[number] =>
  AUTOMATION_OBJECT_NAMES_SINGULAR.some(
    (automationObjectNameSingular) =>
      automationObjectNameSingular === nameSingular,
  );
