import { type Context } from 'react';

import { availableBoardCardFieldsScopedState } from '@/ui/board/states/availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '@/ui/board/states/boardCardFieldsScopedState';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const toViewFieldInput = (
  objectId: 'company' | 'person',
  fieldDefinition: ViewFieldDefinition<ViewFieldMetadata>,
) => ({
  key: fieldDefinition.key,
  name: fieldDefinition.name,
  index: fieldDefinition.index,
  isVisible: fieldDefinition.isVisible ?? true,
  objectId,
});

export const useBoardViewFields = ({
  objectId,
  fieldDefinitions,
  scopeContext,
  skipFetch,
}: {
  objectId: 'company' | 'person';
  fieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  scopeContext: Context<string | null>;
  skipFetch?: boolean;
}) => {
  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );
  const [availableBoardCardFields, setAvailableBoardCardFields] =
    useRecoilScopedState(availableBoardCardFieldsScopedState, scopeContext);
  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    scopeContext,
  );

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();

  const createViewFields = (
    fields: ViewFieldDefinition<ViewFieldMetadata>[],
    viewId = currentViewId,
  ) => {
    if (!viewId || !fields.length) return;

    return createViewFieldsMutation({
      variables: {
        data: fields.map((field) => ({
          ...toViewFieldInput(objectId, field),
          viewId,
        })),
      },
    });
  };

  const { refetch } = useGetViewFieldsQuery({
    skip: !currentViewId || skipFetch,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: async (data) => {
      if (!data.viewFields.length) {
        // Populate if empty
        await createViewFields(fieldDefinitions);
        return refetch();
      }

      const nextFields = data.viewFields
        .map<ViewFieldDefinition<ViewFieldMetadata> | null>((viewField) => {
          const fieldDefinition = fieldDefinitions.find(
            ({ key }) => viewField.key === key,
          );

          return fieldDefinition
            ? {
                ...fieldDefinition,
                key: viewField.key,
                name: viewField.name,
                index: viewField.index,
                isVisible: viewField.isVisible,
              }
            : null;
        })
        .filter<ViewFieldDefinition<ViewFieldMetadata>>(assertNotNull);

      if (!isDeeplyEqual(boardCardFields, nextFields)) {
        setBoardCardFields(nextFields);
      }

      if (!availableBoardCardFields.length) {
        setAvailableBoardCardFields(fieldDefinitions);
      }
    },
  });
};
