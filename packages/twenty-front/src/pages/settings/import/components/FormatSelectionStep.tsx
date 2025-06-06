import { useLingui } from '@lingui/react/macro';
import { IconArrowLeft, IconArrowRight, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { IMPORT_FORMAT_OPTIONS } from '../constants/importFormatOptions';
import {
  StyledFormatDescription,
  StyledFormatDetails,
  StyledFormatIcon,
  StyledFormatOption,
  StyledFormatSelectionContainer,
  StyledFormatTitle,
  StyledNavigationButtons,
} from '../SettingsImport.styles';
import { ImportFormat } from '../types/ImportFormat';
import { Heading } from './Heading';

export const FormatSelectionStep = ({
  selectedFormat,
  onFormatChange,
  onNext,
  onBack,
}: {
  selectedFormat: ImportFormat;
  onFormatChange: (format: ImportFormat) => void;
  onNext: () => void;
  onBack?: () => void;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  return (
    <StyledFormatSelectionContainer>
      <Heading
        title={t({
          id: 'formatSelection.title',
          message: 'Select Import Format',
        })}
        description={t({
          id: 'formatSelection.description',
          message: 'Choose the format of the file you want to import.',
        })}
      />
      {IMPORT_FORMAT_OPTIONS.map((option) => {
        const Icon = getIcon(option.icon);
        const isSelected = selectedFormat === option.value;
        return (
          <StyledFormatOption
            key={option.value}
            selected={isSelected}
            onClick={() => onFormatChange(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFormatChange(option.value);
              }
            }}
          >
            <StyledFormatIcon selected={isSelected}>
              {Icon && <Icon size={20} />}
            </StyledFormatIcon>
            <StyledFormatDetails>
              <StyledFormatTitle>{option.label}</StyledFormatTitle>
              <StyledFormatDescription>
                {option.description}
              </StyledFormatDescription>
            </StyledFormatDetails>
          </StyledFormatOption>
        );
      })}
      <StyledNavigationButtons>
        {onBack ? (
          <Button
            Icon={IconArrowLeft}
            title={t({
              id: 'formatSelection.back',
              message: 'Back',
            })}
            variant="secondary"
            onClick={onBack}
          />
        ) : (
          <div />
        )}
        <Button
          Icon={IconArrowRight}
          title={t({
            id: 'formatSelection.nextCsv',
            message: 'Continue to Upload',
          })}
          accent="blue"
          onClick={onNext}
        />
      </StyledNavigationButtons>
    </StyledFormatSelectionContainer>
  );
};
