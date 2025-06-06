import { useLingui } from '@lingui/react/macro';
import {
  H2Title,
  IconArrowLeft,
  IconDownload,
  IconInfoCircle,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import type { TypePreservationOption } from '../types/typePreservationOption';
import {
  StyledInfoBox,
  StyledInfoContent,
  StyledInfoDescription,
  StyledInfoTitle,
  StyledNavigationButtons,
  StyledTypeDescription,
  StyledTypeDetails,
  StyledTypeIcon,
  StyledTypeOption,
  StyledTypePreservationContainer,
  StyledTypeTitle,
} from './SettingsExport.styles';

export const TypePreservationStep = ({
  preserveTypes,
  onPreserveTypesChange,
  onBack,
  onExport,
  selectedCount,
}: {
  preserveTypes: boolean;
  onPreserveTypesChange: (preserve: boolean) => void;
  onBack: () => void;
  onExport: () => void;
  selectedCount: number;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const typeOptions: TypePreservationOption[] = [
    {
      value: true,
      title: t`Preserve field types`,
      description: t`Include metadata about field types in the export.`,
      icon: 'IconFileCheck',
      variant: 'positive',
    },
    {
      value: false,
      title: t`Export data only`,
      description: t`Export only the raw data values.`,
      icon: 'IconFileX',
      variant: 'negative',
    },
  ];

  return (
    <StyledTypePreservationContainer>
      <H2Title
        title={t`Data Type Preservation`}
        description={t`Choose how to handle field types in your JSON export`}
      />
      <StyledInfoBox>
        <IconInfoCircle size={20} />
        <StyledInfoContent>
          <StyledInfoTitle>{t`What are field types?`}</StyledInfoTitle>
          <StyledInfoDescription>
            {t`Field types define the kind of data stored in each column.`}
          </StyledInfoDescription>
        </StyledInfoContent>
      </StyledInfoBox>
      {typeOptions.map((option) => {
        const Icon = getIcon(option.icon);
        const isSelected = preserveTypes === option.value;
        return (
          <StyledTypeOption
            key={option.value.toString()}
            selected={isSelected}
            onClick={() => onPreserveTypesChange(option.value)}
          >
            <StyledTypeIcon selected={isSelected} variant={option.variant}>
              {Icon !== null && <Icon size={20} />}
            </StyledTypeIcon>
            <StyledTypeDetails>
              <StyledTypeTitle>{option.title}</StyledTypeTitle>
              <StyledTypeDescription>
                {option.description}
              </StyledTypeDescription>
            </StyledTypeDetails>
          </StyledTypeOption>
        );
      })}
      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t`Back to Format Selection`}
          variant="secondary"
          onClick={onBack}
        />
        <Button
          Icon={IconDownload}
          title={t`Export ${selectedCount} Objects`}
          accent="blue"
          onClick={onExport}
        />
      </StyledNavigationButtons>
    </StyledTypePreservationContainer>
  );
};
