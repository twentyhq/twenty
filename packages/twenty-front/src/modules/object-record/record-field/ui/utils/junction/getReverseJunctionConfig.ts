import {
  getJunctionConfig,
  type JunctionObjectMetadataItem,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isDefined } from 'twenty-shared/utils';

export type ReverseJunctionConfig = {
  junctionObjectMetadata: JunctionObjectMetadataItem;
  relatedObjectMetadata: JunctionObjectMetadataItem;
  relationFieldName: string;
};

type GetReverseJunctionConfigArgs = {
  junctionObjectMetadataId?: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

const reverseJunctionConfigCache = new WeakMap<
  JunctionObjectMetadataItem[],
  Map<string, ReverseJunctionConfig | null>
>();

const resolveReverseJunctionConfig = ({
  junctionObjectMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
}: GetReverseJunctionConfigArgs): ReverseJunctionConfig | null => {
  if (
    !isDefined(junctionObjectMetadataId) ||
    !isDefined(sourceObjectMetadataId)
  ) {
    return null;
  }

  for (const relatedObjectMetadata of objectMetadataItems) {
    for (const forwardJunctionField of relatedObjectMetadata.fields) {
      if (
        !isJunctionRelationField(forwardJunctionField) ||
        forwardJunctionField.relation?.targetObjectMetadata.id !==
          junctionObjectMetadataId
      ) {
        continue;
      }

      const junctionConfig = getJunctionConfig({
        settings: forwardJunctionField.settings,
        relationObjectMetadataId: junctionObjectMetadataId,
        sourceObjectMetadataId: relatedObjectMetadata.id,
        objectMetadataItems,
      });

      if (!isDefined(junctionConfig?.sourceField)) {
        continue;
      }

      const targetsSourceObject = junctionConfig.targetFields.some(
        (targetField) =>
          targetField.relation?.targetObjectMetadata.id ===
            sourceObjectMetadataId ||
          targetField.morphRelations?.some(
            (morphRelation) =>
              morphRelation.targetObjectMetadata.id === sourceObjectMetadataId,
          ),
      );

      if (targetsSourceObject) {
        return {
          junctionObjectMetadata: junctionConfig.junctionObjectMetadata,
          relatedObjectMetadata,
          relationFieldName: junctionConfig.sourceField.name,
        };
      }
    }
  }

  return null;
};

export const getReverseJunctionConfig = (
  args: GetReverseJunctionConfigArgs,
): ReverseJunctionConfig | null => {
  const {
    junctionObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  } = args;

  if (
    !isDefined(junctionObjectMetadataId) ||
    !isDefined(sourceObjectMetadataId)
  ) {
    return null;
  }

  const cacheKey = `${junctionObjectMetadataId}:${sourceObjectMetadataId}`;
  const cachedConfigs = reverseJunctionConfigCache.get(objectMetadataItems);

  if (cachedConfigs?.has(cacheKey)) {
    return cachedConfigs.get(cacheKey) ?? null;
  }

  const resolvedConfig = resolveReverseJunctionConfig(args);
  const configs = cachedConfigs ?? new Map();

  configs.set(cacheKey, resolvedConfig);
  reverseJunctionConfigCache.set(objectMetadataItems, configs);

  return resolvedConfig;
};
