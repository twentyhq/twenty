import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const useObjectMorphJunctionConfigOrThrow = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const junctionConfig = useObjectMorphJunctionConfig({ objectNameSingular });

  if (!isDefined(junctionConfig)) {
    throw new Error(
      doNotTranslate(
        `Cannot resolve morph junction metadata for ${objectNameSingular}`,
      ),
    );
  }

  return junctionConfig;
};
