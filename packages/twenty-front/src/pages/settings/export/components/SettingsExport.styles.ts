import styled from '@emotion/styled';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from 'twenty-ui/input';

export const StyledTableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
`;

export const StyledObjectExportTableRow = styled(TableRow)`
  grid-template-columns: 60px 1fr 120px 80px;
  min-width: 500px;

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 100px 70px;
  }
`;

export const StyledSearchInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const StyledActionButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: 768px) {
    align-self: flex-end;
    width: auto;
  }
`;

export const StyledSelectAllRow = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledObjectNameTableCell = styled(TableCell)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

export const StyledObjectNameLabel = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledSelectTableCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const StyledFormatSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledFormatOption = styled.div<{ selected: boolean }>`
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.quaternary : theme.background.secondary};
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.accent.primary : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accent.quaternary};
    border-color: ${({ theme }) => theme.accent.primary};
  }
`;

export const StyledFormatDetails = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledFormatTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledFormatDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledFormatIcon = styled.div<{ selected: boolean }>`
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.primary : theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 40px;
  justify-content: center;
  transition: all 0.2s ease;
  width: 40px;
`;

export const StyledNavigationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(4)};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const StyledTableHeaderCell = styled(TableHeader)`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledTypePreservationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledContinueButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const StyledTypeOption = styled.div<{ selected: boolean }>`
  align-items: flex-start;
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.quaternary : theme.background.secondary};
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.accent.primary : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accent.quaternary};
    border-color: ${({ theme }) => theme.accent.primary};
  }
`;

export const StyledTypeDetails = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledTypeTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledTypeDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
`;

export const StyledTypeIcon = styled.div<{
  selected: boolean;
  variant: 'positive' | 'negative';
}>`
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.primary : theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, variant }) =>
    variant === 'positive'
      ? theme.color.green50
      : variant === 'negative'
        ? theme.color.red50
        : theme.font.color.secondary};
  display: flex;
  height: 40px;
  justify-content: center;
  transition: all 0.2s ease;
  width: 40px;
`;

export const StyledInfoBox = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.accent.quaternary};
  border: 1px solid ${({ theme }) => theme.accent.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledInfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledInfoTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledInfoDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.4;
`;

export const StyledModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const StyledModalContent = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(6)};
  min-width: 400px;
  max-width: 500px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
`;

export const StyledProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

export const StyledProgressFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
  height: 100%;
  background-color: ${({ theme }) => theme.accent.primary};
  transition: width 0.3s ease;
`;

export const StyledProgressText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;