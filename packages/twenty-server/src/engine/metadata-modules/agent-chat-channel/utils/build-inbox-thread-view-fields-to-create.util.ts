import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { buildInitialViewFieldFlatEntity } from 'src/engine/metadata-modules/view/utils/build-initial-view-field-flat-entity.util';
import { INBOX_THREAD_VIEW_FIELD_DEFINITIONS } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-view-field-definitions.constant';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const buildInboxThreadViewFieldsToCreate = ({
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  existingViewFields = [],
  createdAt,
}: {
  viewUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  existingViewFields?: Pick<
    UniversalFlatViewField,
    'fieldMetadataUniversalIdentifier' | 'position'
  >[];
  createdAt: string;
}): UniversalFlatViewField[] => {
  const firstPosition =
    existingViewFields.length === 0
      ? 0
      : Math.max(...existingViewFields.map(({ position }) => position)) + 1;

  return INBOX_THREAD_VIEW_FIELD_DEFINITIONS.flatMap(
    ({ fieldName, isVisible }, index) => {
      const fieldMetadataUniversalIdentifier =
        STANDARD_OBJECTS.agentChatThread.fields[fieldName].universalIdentifier;

      const isFieldAlreadyInView = existingViewFields.some(
        (existingViewField) =>
          existingViewField.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier,
      );

      if (isFieldAlreadyInView) {
        return [];
      }

      return [
        buildInitialViewFieldFlatEntity({
          applicationUniversalIdentifier,
          initialViewUniversalIdentifier: viewUniversalIdentifier,
          fieldMetadataUniversalIdentifier,
          isVisible,
          size: DEFAULT_VIEW_FIELD_SIZE,
          position: firstPosition + index,
          aggregateOperation: null,
          isActive: true,
          createdAt,
        }),
      ];
    },
  );
};
