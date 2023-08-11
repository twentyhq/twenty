import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { GET_VIEW_FIELDS } from '@/views/queries/select';
import { currentViewIdState } from '@/views/states/currentViewIdState';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
} from '~/generated/graphql';

import { entityTableDimensionsState } from '../states/entityTableDimensionsState';
import { viewFieldsState } from '../states/viewFieldsState';

const DEFAULT_VIEW_FIELD_METADATA: ViewFieldTextMetadata = {
  type: 'text',
  placeHolder: '',
  fieldName: '',
};

export const toViewFieldInput = (
  objectName: 'company' | 'person',
  viewFieldDefinition: ViewFieldDefinition<ViewFieldMetadata>,
) => ({
  fieldName: viewFieldDefinition.columnLabel,
  index: viewFieldDefinition.columnOrder,
  isVisible: viewFieldDefinition.isVisible ?? true,
  objectName,
  sizeInPx: viewFieldDefinition.columnSize,
});

export const useLoadViewFields = ({
  objectName,
  viewFieldDefinitions,
}: {
  objectName: 'company' | 'person';
  viewFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
}) => {
  const currentViewId = useRecoilValue(currentViewIdState);
  const setEntityTableDimensions = useSetRecoilState(
    entityTableDimensionsState,
  );
  const setViewFieldsState = useSetRecoilState(viewFieldsState);

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();

  useGetViewFieldsQuery({
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        objectName: { equals: objectName },
        viewId: { equals: currentViewId ?? null },
      },
    },
    onCompleted: (data) => {
      if (data.viewFields.length) {
        const viewFields = data.viewFields.map<
          ViewFieldDefinition<ViewFieldMetadata>
        >((viewField) => ({
          ...(viewFieldDefinitions.find(
            ({ columnLabel }) => viewField.fieldName === columnLabel,
          ) || { metadata: DEFAULT_VIEW_FIELD_METADATA }),
          id: viewField.id,
          columnLabel: viewField.fieldName,
          columnOrder: viewField.index,
          columnSize: viewField.sizeInPx,
          isVisible: viewField.isVisible,
        }));

        setViewFieldsState({ objectName, viewFields });
        setEntityTableDimensions((prevState) => ({
          ...prevState,
          numberOfColumns: data.viewFields.length,
        }));

        return;
      }

      // Populate if empty
      createViewFieldsMutation({
        variables: {
          data: viewFieldDefinitions.map((viewFieldDefinition) => ({
            ...toViewFieldInput(objectName, viewFieldDefinition),
            viewId: currentViewId,
          })),
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
  });
};
