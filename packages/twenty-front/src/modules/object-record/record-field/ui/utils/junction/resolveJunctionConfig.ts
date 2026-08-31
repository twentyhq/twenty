import {
  getJunctionConfig,
  type GetJunctionConfigArgs,
  type JunctionObjectMetadataItem,
  type ValidJunctionConfig,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { resolveReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveReverseJunctionConfig';
import { hasJunctionTargetFieldId } from '@/object-record/record-field/ui/utils/junction/hasJunctionTargetFieldId';
import { isDefined } from 'twenty-shared/utils';

type JunctionDirection = 'forward' | 'reverse';

export type ValidResolvedJunctionConfig = ValidJunctionConfig & {
  direction: JunctionDirection;
  isValid: true;
};

export type InvalidResolvedJunctionConfig = {
  junctionObjectMetadata?: JunctionObjectMetadataItem;
  targetFields: [];
  sourceField?: never;
  isMorphRelation: false;
  direction: JunctionDirection;
  isValid: false;
};

export type ResolvedJunctionConfig =
  | ValidResolvedJunctionConfig
  | InvalidResolvedJunctionConfig;

const toValidResolvedJunctionConfig = (
  junctionConfig: ValidJunctionConfig,
  direction: JunctionDirection,
): ValidResolvedJunctionConfig => ({
  junctionObjectMetadata: junctionConfig.junctionObjectMetadata,
  sourceField: junctionConfig.sourceField,
  targetFields: junctionConfig.targetFields,
  isMorphRelation: junctionConfig.isMorphRelation,
  direction,
  isValid: true,
});

const getInvalidResolvedJunctionConfig = ({
  junctionObjectMetadataId,
  direction,
  objectMetadataItems,
}: {
  junctionObjectMetadataId: string;
  direction: JunctionDirection;
  objectMetadataItems: JunctionObjectMetadataItem[];
}): InvalidResolvedJunctionConfig => {
  const junctionObjectMetadata = objectMetadataItems.find(
    ({ id }) => id === junctionObjectMetadataId,
  );

  return {
    ...(isDefined(junctionObjectMetadata) ? { junctionObjectMetadata } : {}),
    targetFields: [],
    isMorphRelation: false,
    direction,
    isValid: false,
  };
};

export const resolveJunctionConfig = ({
  settings,
  relationObjectMetadataId,
  relationTargetFieldMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
}: GetJunctionConfigArgs): ResolvedJunctionConfig | null => {
  const forwardJunctionConfig = getJunctionConfig({
    settings,
    relationObjectMetadataId,
    relationTargetFieldMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  const isConfiguredOnCurrentField = hasJunctionTargetFieldId(settings);

  if (isConfiguredOnCurrentField) {
    if (forwardJunctionConfig?.isValid) {
      return toValidResolvedJunctionConfig(forwardJunctionConfig, 'forward');
    }

    return getInvalidResolvedJunctionConfig({
      junctionObjectMetadataId: relationObjectMetadataId,
      direction: 'forward',
      objectMetadataItems,
    });
  }

  const reverseJunctionResolution = resolveReverseJunctionConfig({
    junctionObjectMetadataId: relationObjectMetadataId,
    relationTargetFieldMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  if (
    reverseJunctionResolution.status === 'ambiguous' ||
    reverseJunctionResolution.status === 'invalid'
  ) {
    return getInvalidResolvedJunctionConfig({
      junctionObjectMetadataId: relationObjectMetadataId,
      direction: 'reverse',
      objectMetadataItems,
    });
  }

  const reverseJunctionConfig =
    reverseJunctionResolution.status === 'resolved'
      ? reverseJunctionResolution.junctionConfig
      : null;

  if (reverseJunctionConfig?.isConfiguredOnOwningSide) {
    return toValidResolvedJunctionConfig(reverseJunctionConfig, 'reverse');
  }

  if (isDefined(forwardJunctionConfig) && isDefined(reverseJunctionConfig)) {
    return getInvalidResolvedJunctionConfig({
      junctionObjectMetadataId: relationObjectMetadataId,
      direction: 'reverse',
      objectMetadataItems,
    });
  }

  if (isDefined(forwardJunctionConfig)) {
    return !forwardJunctionConfig.isValid
      ? getInvalidResolvedJunctionConfig({
          junctionObjectMetadataId: relationObjectMetadataId,
          direction: 'forward',
          objectMetadataItems,
        })
      : toValidResolvedJunctionConfig(forwardJunctionConfig, 'forward');
  }

  if (isDefined(reverseJunctionConfig)) {
    return toValidResolvedJunctionConfig(reverseJunctionConfig, 'reverse');
  }

  return null;
};
