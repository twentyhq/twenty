import { renderHook } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const recordId = 'test-record-id';
const fieldComponentInstanceId = 'test-field-component-instance-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <RecordFieldComponentInstanceContext.Provider
      value={{ instanceId: fieldComponentInstanceId }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: textfieldDefinition,
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <RecordInlineCellContext.Provider
          value={{
            onOpenEditMode: jest.fn(),
            onCloseEditMode: jest.fn(),
          }}
        >
          {children}
        </RecordInlineCellContext.Provider>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  </RecoilRoot>
);

const renderUseInlineCellHook = () => {
  return renderHook(
    () => {
      const inlineCell = useInlineCell();
      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);
      const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

      return {
        ...inlineCell,
        focusStack,
        currentFocusId,
        activeDropdownFocusId,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
};

describe('useInlineCell', () => {
  const expectedFocusId = getDropdownFocusIdForRecordField(
    recordId,
    textfieldDefinition.fieldMetadataId,
    'inline-cell',
  );

  describe('openInlineCell', () => {
    it('should push focus item to focus stack when opening inline cell', async () => {
      const { result } = renderUseInlineCellHook();

      expect(result.current.focusStack).toEqual([]);
      expect(result.current.currentFocusId).toBeUndefined();

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.focusStack).toHaveLength(1);
      expect(result.current.focusStack[0]).toEqual({
        focusId: expectedFocusId,
        componentInstance: {
          componentType: FocusComponentType.OPENED_FIELD_INPUT,
          componentInstanceId: expectedFocusId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
      expect(result.current.currentFocusId).toEqual(expectedFocusId);
    });

    it('should set active dropdown focus id when opening inline cell', async () => {
      const { result } = renderUseInlineCellHook();

      expect(result.current.activeDropdownFocusId).toBeNull();

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.activeDropdownFocusId).toEqual(expectedFocusId);
    });
  });

  describe('closeInlineCell', () => {
    it('should remove focus item from focus stack when closing inline cell', async () => {
      const { result } = renderUseInlineCellHook();

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.focusStack).toHaveLength(1);
      expect(result.current.currentFocusId).toEqual(expectedFocusId);

      await act(async () => {
        result.current.closeInlineCell();
      });

      expect(result.current.focusStack).toEqual([]);
      expect(result.current.currentFocusId).toBeUndefined();
    });

    it('should restore previous focus when closing inline cell with existing focus stack', async () => {
      const { result } = renderUseInlineCellHook();

      const sidePanelFocusId = 'side-panel-focus-id';

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.currentFocusId).toEqual(expectedFocusId);

      await act(async () => {
        result.current.closeInlineCell();
      });

      expect(result.current.focusStack).toEqual([]);
      expect(result.current.currentFocusId).toBeUndefined();
    });
  });

  describe('focus stack integration', () => {
    it('should properly manage focus stack during open/close cycle', async () => {
      const { result } = renderUseInlineCellHook();

      expect(result.current.focusStack).toEqual([]);

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.focusStack).toHaveLength(1);
      expect(result.current.currentFocusId).toEqual(expectedFocusId);

      await act(async () => {
        result.current.closeInlineCell();
      });

      expect(result.current.focusStack).toEqual([]);
      expect(result.current.currentFocusId).toBeUndefined();

      await act(async () => {
        result.current.openInlineCell();
      });

      expect(result.current.focusStack).toHaveLength(1);
      expect(result.current.currentFocusId).toEqual(expectedFocusId);
    });
  });
});
