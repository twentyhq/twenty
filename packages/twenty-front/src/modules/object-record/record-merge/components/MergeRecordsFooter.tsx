import styled from '@emotion/styled';
import { IconArrowMerge, IconDotsVertical } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFooterActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type MergeRecordsFooterProps = {
  onMerge: () => void;
  onOptionsClick?: () => void;
  isMerging: boolean;
};

export const MergeRecordsFooter = ({
  onMerge,
  isMerging,
}: MergeRecordsFooterProps) => {
  return (
    <StyledFooterContainer>
      <StyledFooterActions>
        <Button
          title="Options"
          variant="secondary"
          accent="default"
          size="medium"
          Icon={IconDotsVertical}
          disabled={isMerging}
        />

        <Button
          title={isMerging ? 'Merging...' : 'Merge'}
          variant="primary"
          accent="blue"
          size="medium"
          Icon={IconArrowMerge}
          hotkeys={isMerging ? undefined : ['⌘', '⏎']}
          onClick={onMerge}
          disabled={isMerging}
        />
      </StyledFooterActions>
    </StyledFooterContainer>
  );
};
