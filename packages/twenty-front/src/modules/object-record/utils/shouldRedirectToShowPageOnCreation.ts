import { CoreObjectNameSingular } from "@/object-metadata/types/CoreObjectNameSingular";

export const shouldRedirectToShowPageOnCreation = (objectNameSingular: string) => {
    if (
        objectNameSingular === CoreObjectNameSingular.Workflow
      ) {
        return true;
    }

    return false;
};