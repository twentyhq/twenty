import { act } from 'react-dom/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { FieldType } from '@/object-record/field/types/FieldType';
import { useRecordBoardCardFieldsInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardCardFieldsInternal';
import { onFieldsChangeScopedState } from '@/object-record/record-board/states/onFieldsChangeScopedState';
import { recordBoardCardFieldsScopedState } from '@/object-record/record-board/states/recordBoardCardFieldsScopedState';
import { savedRecordBoardCardFieldsScopedState } from '@/object-record/record-board/states/savedRecordBoardCardFieldsScopedState';

const recordBoardScopeId = 'recordBoardScopeId';

const renderHookConfig = {
  wrapper: RecoilRoot,
};

describe('useRecordBoardCardFieldsInternal', () => {
  it('should toggle field visibility', async () => {
    const { result } = renderHook(() => {
      const [cardFieldsList, setCardFieldsList] = useRecoilState(
        recordBoardCardFieldsScopedState({ scopeId: recordBoardScopeId }),
      );
      return {
        boardCardFields: useRecordBoardCardFieldsInternal({
          recordBoardScopeId,
        }),
        cardFieldsList,
        setCardFieldsList,
      };
    }, renderHookConfig);

    const field = {
      position: 0,
      fieldMetadataId: 'id',
      label: 'label',
      iconName: 'icon',
      type: 'TEXT' as FieldType,
      metadata: {
        fieldName: 'fieldName',
      },
      isVisible: true,
    };

    act(() => {
      result.current.setCardFieldsList([field]);
    });

    expect(result.current.cardFieldsList[0].isVisible).toBe(true);

    act(() => {
      result.current.boardCardFields.handleFieldVisibilityChange({
        ...field,
        isVisible: true,
      });
    });

    waitFor(() => {
      expect(result.current.cardFieldsList[0].isVisible).toBe(false);
    });

    act(() => {
      result.current.boardCardFields.handleFieldVisibilityChange({
        ...field,
        isVisible: false,
      });
    });

    waitFor(() => {
      expect(result.current.cardFieldsList[0].isVisible).toBe(true);
    });
  });

  it('should call the onFieldsChange callback and update board card states', async () => {
    const { result } = renderHook(() => {
      const [onFieldsChange, setOnFieldsChange] = useRecoilState(
        onFieldsChangeScopedState({ scopeId: recordBoardScopeId }),
      );
      return {
        boardCardFieldsHook: useRecordBoardCardFieldsInternal({
          recordBoardScopeId,
        }),
        boardCardFieldsList: useRecoilValue(
          recordBoardCardFieldsScopedState({ scopeId: recordBoardScopeId }),
        ),
        savedBoardCardFieldsList: useRecoilValue(
          savedRecordBoardCardFieldsScopedState({
            scopeId: recordBoardScopeId,
          }),
        ),
        onFieldsChange,
        setOnFieldsChange,
      };
    }, renderHookConfig);

    const field = {
      position: 0,
      fieldMetadataId: 'id',
      label: 'label',
      iconName: 'icon',
      type: 'TEXT' as FieldType,
      metadata: {
        fieldName: 'fieldName',
      },
      isVisible: true,
    };
    const onChangeFunction = jest.fn();

    await act(async () => {
      result.current.setOnFieldsChange(() => onChangeFunction);
      result.current.boardCardFieldsHook.handleFieldsReorder([field]);
    });

    expect(onChangeFunction).toHaveBeenCalledWith([field]);
    expect(result.current.savedBoardCardFieldsList).toStrictEqual([field]);
    expect(result.current.boardCardFieldsList).toStrictEqual([field]);
  });
});
