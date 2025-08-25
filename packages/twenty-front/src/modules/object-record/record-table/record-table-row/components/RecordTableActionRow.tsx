import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { useTheme } from '@emotion/react';
import { type IconComponent } from 'twenty-ui/display';

const StyledRecordTableDraggableTr = styled.tr`
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.animation.duration.fast}
    ease-in-out;
  border: none;
  background: ${({ theme }) => theme.background.primary};
  position: relative;
  z-index: ${TABLE_Z_INDEX.base};

  &:hover {
    td:not(:first-of-type) {
      background-color: ${({ theme }) => theme.background.transparent.light};
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    background-color: ${({ theme }) => theme.background.primary};
    transition: background-color ${({ theme }) => theme.animation.duration.fast}
      ease-in-out;

    &:first-of-type {
      border-bottom: 1px solid ${({ theme }) => theme.background.primary};
    }
  }
`;

const StyledIconContainer = styled(RecordTableTd)`
  align-items: center;
  background-color: transparent;
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
`;

const StyledRecordTableTdTextContainer = styled(RecordTableTd)`
  background-color: transparent;
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

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <StyledRecordTableDraggableTr onClick={onClick}>
      <td aria-hidden />
      <StyledIconContainer>
        <LeftIcon
          stroke={theme.icon.stroke.sm}
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      </StyledIconContainer>
      <StyledRecordTableTdTextContainer className="disable-shadow">
        <StyledText>{text}</StyledText>
      </StyledRecordTableTdTextContainer>
      <td colSpan={visibleRecordFields.length - 1} aria-hidden />
      <td aria-hidden />
      <td aria-hidden />
    </StyledRecordTableDraggableTr>
  );
};
