import { useRecoilValue, useSetRecoilState } from 'recoil';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { availableBoardCardFieldsScopedState } from '@/ui/board/states/availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '@/ui/board/states/boardCardFieldsScopedState';
import { savedBoardCardFieldsFamilyState } from '@/ui/board/states/savedBoardCardFieldsFamilyState';
import { savedBoardCardFieldsByKeyFamilySelector } from '@/ui/board/states/selectors/savedBoardCardFieldsByKeyFamilySelector';
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
  useUpdateViewFieldMutation,
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
  skipFetch,
  RecoilScopeContext,
}: {
  objectId: 'company' | 'person';
  fieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  skipFetch?: boolean;
  RecoilScopeContext: RecoilScopeContext;
}) => {
  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    RecoilScopeContext,
  );
  const [availableBoardCardFields, setAvailableBoardCardFields] =
    useRecoilScopedState(
      availableBoardCardFieldsScopedState,
      RecoilScopeContext,
    );
  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    RecoilScopeContext,
  );
  const setSavedBoardCardFields = useSetRecoilState(
    savedBoardCardFieldsFamilyState(currentViewId),
  );
  const savedBoardCardFieldsByKey = useRecoilValue(
    savedBoardCardFieldsByKeyFamilySelector(currentViewId),
  );

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

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

  const updateViewFields = (
    fields: ViewFieldDefinition<ViewFieldMetadata>[],
  ) => {
    if (!currentViewId || !fields.length) return;

    return Promise.all(
      fields.map((field) =>
        updateViewFieldMutation({
          variables: {
            data: {
              isVisible: field.isVisible,
            },
            where: {
              viewId_key: { key: field.key, viewId: currentViewId },
            },
          },
        }),
      ),
    );
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
        setSavedBoardCardFields(nextFields);
        setBoardCardFields(nextFields);
      }

      if (!availableBoardCardFields.length) {
        setAvailableBoardCardFields(fieldDefinitions);
      }
    },
  });

  const persistCardFields = async () => {
    if (!currentViewId) return;

    const viewFieldsToCreate = boardCardFields.filter(
      (field) => !savedBoardCardFieldsByKey[field.key],
    );
    await createViewFields(viewFieldsToCreate);

    const viewFieldsToUpdate = boardCardFields.filter(
      (field) =>
        savedBoardCardFieldsByKey[field.key] &&
        savedBoardCardFieldsByKey[field.key].isVisible !== field.isVisible,
    );
    await updateViewFields(viewFieldsToUpdate);

    return refetch();
  };

  return { createViewFields, persistCardFields };
};
