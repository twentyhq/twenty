import styled from '@emotion/styled';

import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import { IconComponent } from 'twenty-ui';

const StyledTrContainer = styled.tr`
  cursor: pointer;
`;

const StyledIconContainer = styled(RecordTableTd)`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  vertical-align: middle;
  padding-top: 3px;
`;

const StyledRecordTableTdTextContainer = styled(RecordTableTd)`
  border-right: none;
  height: 32px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
  vertical-align: middle;
`;

const StyledEmptyTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

type RecordTableActionRowProps = {
  LeftIcon: IconComponent;
  text: string;
  onClick?: (event?: React.MouseEvent<HTMLTableRowElement>) => void;
};

export const RecordTableActionRow = ({
  LeftIcon,
  text,
  onClick,
}: RecordTableActionRowProps) => {
  const theme = useTheme();

  const visibleColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  return (
    <StyledTrContainer onClick={onClick}>
      <td aria-hidden />
      <StyledIconContainer>
        <LeftIcon size={theme.icon.size.sm} color={theme.font.color.tertiary} />
      </StyledIconContainer>
      <StyledRecordTableTdTextContainer colSpan={visibleColumns.length}>
        <StyledText>{text}</StyledText>
      </StyledRecordTableTdTextContainer>
      <StyledEmptyTd />
      <StyledEmptyTd />
    </StyledTrContainer>
  );
};
