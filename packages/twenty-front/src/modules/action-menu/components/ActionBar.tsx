import styled from '@emotion/styled';

import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { ActionBarItem } from './ActionBarItem';

const StyledContainerActionBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 38px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  height: 48px;
  width: max-content;
  left: 50%;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: auto;

  transform: translateX(-50%);
  z-index: 1;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const ActionBar = ({
  selectedRecordIds,
  actionMenuEntries,
}: {
  selectedRecordIds: string[];
  actionMenuEntries: ActionMenuEntry[];
}) => {
  return (
    <>
      <StyledContainerActionBar data-select-disable className="action-bar">
        <StyledLabel>{selectedRecordIds?.length} selected:</StyledLabel>
        {actionMenuEntries.map((item, index) => (
          <ActionBarItem key={index} item={item} />
        ))}
      </StyledContainerActionBar>
    </>
  );
};
