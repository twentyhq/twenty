import styled from '@emotion/styled';
import { ImportSummary } from './types/ImportSummary';

export type HeadingProps = {
  title: string;
  description?: string;
};

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

export const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-align: center;
`;

export const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export const StyledFormatSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledFormatOption = styled.div<{ selected: boolean }>`
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.tertiary : theme.background.secondary};
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
    background-color: ${({ theme }) => theme.accent.tertiary};
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
  color: ${({ theme, selected }) =>
    selected ? theme.font.color.inverted : theme.font.color.secondary};
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
    & > button {
      width: 100%;
    }
    & > button:first-of-type {
      margin-bottom: ${({ theme }) => theme.spacing(2)};
    }
  }
`;

export const StyledInfoBox = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.accent.tertiary};
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

export const StyledDropArea = styled.div<{ isDragOver?: boolean }>`
  align-items: center;
  background-color: ${({ theme, isDragOver }) =>
    isDragOver ? theme.accent.tertiary : theme.background.secondary};
  border: 2px dashed
    ${({ theme, isDragOver }) =>
      isDragOver ? theme.accent.primary : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: 200px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)};
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accent.tertiary};
    border-color: ${({ theme }) => theme.accent.primary};
  }
`;

export const StyledFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-height: 250px;
  overflow-y: auto;
`;

export const StyledFileItem = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

export const StyledFileName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledFileDetails = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledImportSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

export const StyledObjectConfigurationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledFormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const StyledFormField = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledFormLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledFormError = styled.span`
  color: ${({ theme }) => theme.color.red50};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const StyledIconSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 200px;
`;

export const StyledIconDropdownTrigger = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

export const StyledIconPreview = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledColumnMappingGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledColumnMappingRow = styled.div<{ isIgnored?: boolean }>`
  align-items: center;
  background-color: ${({ theme, isIgnored }) =>
    isIgnored
      ? theme.background.transparent.light
      : theme.background.secondary};
  border: 1px solid
    ${({ theme, isIgnored }) =>
      isIgnored ? theme.border.color.light : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  opacity: ${({ isIgnored }) => (isIgnored ? 0.6 : 1)};
  padding: ${({ theme }) => theme.spacing(3)};
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const StyledColumnInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

export const StyledColumnName = styled.div<{ isIgnored?: boolean }>`
  color: ${({ theme, isIgnored }) =>
    isIgnored ? theme.font.color.tertiary : theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-decoration: ${({ isIgnored }) => (isIgnored ? 'line-through' : 'none')};
`;

export const StyledColumnSample = styled.div<{ isIgnored?: boolean }>`
  color: ${({ theme, isIgnored }) =>
    isIgnored ? theme.font.color.tertiary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-family: ${({ theme }) => theme.font.family};
`;

export const StyledTypeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 200px;
  @media (max-width: 768px) {
    min-width: unset;
    width: 100%;
  }
`;

export const StyledTypeSelector = styled.div`
  min-width: 150px;
  @media (max-width: 768px) {
    min-width: unset;
    width: 100%;
  }
`;

export const StyledSubTypeSelector = styled.div`
  min-width: 150px;
  @media (max-width: 768px) {
    min-width: unset;
    width: 100%;
  }
`;

export const StyledDropdownTrigger = styled.div<{ isIgnored?: boolean }>`
  align-items: center;
  background-color: ${({ theme, isIgnored }) =>
    isIgnored ? theme.background.transparent.light : theme.background.primary};
  border: 1px solid
    ${({ theme, isIgnored }) =>
      isIgnored ? theme.border.color.light : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, isIgnored }) =>
    isIgnored ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, isIgnored }) =>
      isIgnored
        ? theme.background.transparent.medium
        : theme.background.secondary};
    border-color: ${({ theme, isIgnored }) =>
      isIgnored ? theme.border.color.medium : theme.border.color.strong};
  }
`;

export const StyledCreateObjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledLoadingCard = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.tertiary};
  border: 1px solid ${({ theme }) => theme.accent.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const StyledLoadingIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.primary};
  border-radius: 50%;
  color: white;
  display: flex;
  height: 32px;
  justify-content: center;
  min-width: 32px;
  width: 32px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.color.blue70};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledSuccessCard = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.green10};
  border: 1px solid ${({ theme }) => theme.color.green20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledSuccessIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.green50};
  border-radius: 50%;
  color: white;
  display: flex;
  height: 24px;
  justify-content: center;
  min-width: 24px;
  width: 24px;
`;

export const StyledSuccessText = styled.div`
  color: ${({ theme }) => theme.color.green70};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledImportDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledImportProgress = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const StyledProgressHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const StyledProgressIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.inverted};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

export const StyledProgressTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

export const StyledProgressContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledImportStats = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

export const StyledStatItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledStatNumber = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const StyledStatLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledWarningBox = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.color.yellow10};
  border: 1px solid ${({ theme }) => theme.color.yellow20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const StyledWarningContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledWarningTitle = styled.div`
  color: ${({ theme }) => theme.color.yellow70};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledWarningDescription = styled.div`
  color: ${({ theme }) => theme.color.yellow70};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.4;
`;

export const StyledProgressTracker = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export const StyledSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledSummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledSummaryItem = styled.div<{
  status: ImportSummary['status'];
}>`
  align-items: flex-start;
  background-color: ${({ theme, status }) =>
    status === 'success'
      ? theme.color.green10
      : status === 'failed'
        ? theme.color.red10
        : theme.background.secondary};
  border: 1px solid
    ${({ theme, status }) =>
      status === 'success'
        ? theme.color.green20
        : status === 'failed'
          ? theme.color.red20
          : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledSummaryIcon = styled.div<{
  status: ImportSummary['status'];
}>`
  align-items: center;
  color: ${({ theme, status }) =>
    status === 'success'
      ? theme.color.green50
      : status === 'failed'
        ? theme.color.red50
        : theme.font.color.secondary};
  display: flex;
  height: 24px;
  justify-content: center;
  margin-top: 2px;
  width: 24px;
`;

export const StyledSummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledSummaryFileName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledSummaryMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;
