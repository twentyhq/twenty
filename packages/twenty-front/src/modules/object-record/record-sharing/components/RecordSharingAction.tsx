import { styled } from '@linaria/react';
import { MenuItem, type MenuItemProps } from 'twenty-ui/components';

const StyledAction = styled.button`
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  padding: 0;
  text-align: left;
  width: 100%;
`;

type RecordSharingActionProps = Pick<
  MenuItemProps,
  'text' | 'contextualText' | 'LeftIcon' | 'disabled'
> & {
  onClick: () => void;
};

export const RecordSharingAction = ({
  onClick,
  disabled,
  text,
  contextualText,
  LeftIcon,
}: RecordSharingActionProps) => (
  <StyledAction type="button" disabled={disabled} onClick={onClick}>
    <MenuItem
      text={text}
      contextualText={contextualText}
      LeftIcon={LeftIcon}
      disabled={disabled}
    />
  </StyledAction>
);
