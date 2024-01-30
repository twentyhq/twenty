import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getScopedFamilyStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedFamilyStateDeprecated';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import { currentViewFieldsScopedFamilyState } from '@/views/states/currentViewFieldsScopedFamilyState';
import { ViewField } from '@/views/types/ViewField';

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => {
  return {
    useMapFieldMetadataToGraphQLQuery: jest.fn().mockReturnValue(() => '\n'),
  };
});

const fieldMetadataId = '12ecdf87-506f-44a7-98c6-393e5f05b225';

const fieldDefinition: ColumnDefinition<FieldMetadata> = {
  size: 1,
  position: 1,
  fieldMetadataId,
  label: 'label',
  iconName: 'icon',
  type: 'TEXT',
  metadata: {
    placeHolder: 'placeHolder',
    fieldName: 'fieldName',
  },
};
const viewField: ViewField = {
  id: '88930a16-685f-493b-a96b-91ca55666bba',
  fieldMetadataId,
  position: 1,
  isVisible: true,
  size: 1,
  definition: fieldDefinition,
};

const viewBarId = 'viewBarTestId';

const currentViewId = '23f5dceb-3482-4e3a-9bb4-2f52f2556be9';

const mocks = [
  {
    request: {
      query: gql`
        mutation CreateOneViewField($input: ViewFieldCreateInput!) {
          createViewField(data: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          fieldMetadataId,
          viewId: currentViewId,
          isVisible: true,
          size: 1,
          position: 1,
        },
      },
    },
    result: jest.fn(() => ({
      data: { createViewField: { id: '' } },
    })),
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecoilRoot>
        <ViewScope viewScopeId="viewScopeId">{children}</ViewScope>
      </RecoilRoot>
    </MockedProvider>
  </MemoryRouter>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useViewBar > viewFields', () => {
  it('should update current fields', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        currentFields: useRecoilState(
          getScopedFamilyStateDeprecated(
            currentViewFieldsScopedFamilyState,
            viewBarId,
            currentViewId,
          ),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.currentFields).toStrictEqual([]);
    await act(async () => {
      result.current.viewBar.setCurrentViewId(currentViewId);
      result.current.viewBar.setViewObjectMetadataId('newId');
      result.current.viewBar.persistViewFields([viewField]);
    });

    await waitFor(() =>
      expect(result.current.currentFields).toEqual([viewField]),
    );
  });

  it('should persist view fields', async () => {
    const { result } = renderHook(
      () => useViewBar({ viewBarId }),
      renderHookConfig,
    );

    await act(async () => {
      result.current.setCurrentViewId(currentViewId);
      result.current.setViewObjectMetadataId('newId');
      await result.current.persistViewFields([viewField]);
    });

    const persistViewFieldsMutation = mocks[0];

    await waitFor(() =>
      expect(persistViewFieldsMutation.result).toHaveBeenCalled(),
    );
  });

  it('should load view fields', async () => {
    const currentViewId = 'ac8807fd-0065-436d-bdf6-94333d75af6e';

    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });

      const { currentViewFieldsState } = useViewScopedStates({
        viewScopeId: viewBarId,
      });
      const currentViewFields = useRecoilValue(currentViewFieldsState);

      return {
        viewBar,
        currentViewFields,
      };
    }, renderHookConfig);

    expect(result.current.currentViewFields).toStrictEqual([]);

    await act(async () => {
      result.current.viewBar.setAvailableFieldDefinitions([fieldDefinition]);

      await result.current.viewBar.loadViewFields([viewField], currentViewId);
      result.current.viewBar.setCurrentViewId(currentViewId);
    });

    expect(result.current.currentViewFields).toStrictEqual([viewField]);
  });
});
