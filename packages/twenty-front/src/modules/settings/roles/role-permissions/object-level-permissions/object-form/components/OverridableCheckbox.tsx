import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconReload, IconX } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { AnimatedRotate } from 'twenty-ui/utilities';

export type OverridableCheckboxType = 'default' | 'override' | 'no_cta';

const StyledOverridableCheckboxContainer = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: flex-start;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
  RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
`;

const StyledOverridableCheckboxContainerItem = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledIconWrapper = styled.div<{
  isDisabled?: boolean;
}>`
  align-items: center;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  width: 100%;
`;

export type OverridableCheckboxProps = {
  type?: OverridableCheckboxType;
  onChange: () => void;
  checked: boolean;
  disabled: boolean;
};

export const OverridableCheckbox = ({
  type = 'default',
  onChange,
  checked,
  disabled,
}: OverridableCheckboxProps) => {
  const theme = useTheme();

  return (
    <StyledOverridableCheckboxContainer>
      {type === 'default' && (
        <>
          <StyledOverridableCheckboxContainerItem>
            <Checkbox checked={true} disabled={true} />
          </StyledOverridableCheckboxContainerItem>
          <StyledOverridableCheckboxContainerItem>
            <StyledIconWrapper
              onClick={disabled ? undefined : onChange}
              isDisabled={disabled}
            >
              {!disabled && (
                <AnimatedRotate>
                  <IconX
                    size={theme.icon.size.md}
                    color={theme.font.color.secondary}
                  />
                </AnimatedRotate>
              )}
            </StyledIconWrapper>
          </StyledOverridableCheckboxContainerItem>
        </>
      )}
      {type === 'override' && (
        <>
          <StyledOverridableCheckboxContainerItem>
            <Checkbox checked={false} disabled={true} />
          </StyledOverridableCheckboxContainerItem>
          <StyledOverridableCheckboxContainerItem>
            <StyledIconWrapper
              onClick={disabled ? undefined : onChange}
              isDisabled={disabled}
            >
              <AnimatedRotate animateOnHover={!disabled}>
                <IconReload
                  size={theme.icon.size.md}
                  color={theme.adaptiveColors.orange4}
                />
              </AnimatedRotate>
            </StyledIconWrapper>
          </StyledOverridableCheckboxContainerItem>
        </>
      )}
      {type === 'no_cta' && (
        <StyledOverridableCheckboxContainerItem>
          <AnimatedRotate>
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            />
          </AnimatedRotate>
        </StyledOverridableCheckboxContainerItem>
      )}
    </StyledOverridableCheckboxContainer>
  );
};
