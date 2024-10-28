import { WorkflowTrigger } from "@/workflow/types/Workflow";
import { capitalize } from "~/utils/string/capitalize";

export const getTriggerStepName = (trigger: WorkflowTrigger): string => {
    switch (trigger.type) {
        case 'DATABASE_EVENT':
            const [object, action] = trigger.settings.eventName.split('.');
            return `${capitalize(object)} is ${capitalize(action)}`;
        case 'MANUAL':
            const objectType = trigger.settings.objectType;

            if (!objectType) {
                return 'toto';
            }

            return 'Manual trigger for ' + capitalize(objectType);
        default:
            return '';

    }
}