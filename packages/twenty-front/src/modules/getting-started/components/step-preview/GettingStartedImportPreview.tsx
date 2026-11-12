import { GettingStartedStepPreview } from '@/getting-started/components/step-preview/GettingStartedStepPreview';
import { GettingStartedStepPreviewBadge } from '@/getting-started/components/step-preview/GettingStartedStepPreviewBadge';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type IconComponent,
  IconBuildingSkyscraper,
  IconFile,
  IconMail,
  IconSparkles,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const PILL_HEIGHT = 26;
const PILL_GAP = 12;

const SOURCE_COLUMNS = doNotTranslate([
  'Full name',
  'E-mail address',
  'Org',
  'Deal value (USD)',
]);

const TARGET_FIELDS: {
  id: string;
  Icon: IconComponent;
  label: MessageDescriptor;
  objectLabel: MessageDescriptor;
}[] = [
  { id: 'name', Icon: IconUser, label: msg`Name`, objectLabel: msg`People` },
  {
    id: 'company',
    Icon: IconBuildingSkyscraper,
    label: msg`Company`,
    objectLabel: msg`People`,
  },
  {
    id: 'emails',
    Icon: IconMail,
    label: msg`Emails`,
    objectLabel: msg`People`,
  },
  {
    id: 'amount',
    Icon: IconTargetArrow,
    label: msg`Amount`,
    objectLabel: msg`Opportunities`,
  },
];

const WIRES = [
  { sourceIndex: 0, targetIndex: 0 },
  { sourceIndex: 1, targetIndex: 2 },
  { sourceIndex: 2, targetIndex: 1 },
  { sourceIndex: 3, targetIndex: 3 },
];

const getPillCenter = (index: number) =>
  index * (PILL_HEIGHT + PILL_GAP) + PILL_HEIGHT / 2;

const WIRES_HEIGHT =
  SOURCE_COLUMNS.length * PILL_HEIGHT + (SOURCE_COLUMNS.length - 1) * PILL_GAP;

const StyledMapping = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[10]};
`;

const StyledSide = styled.div`
  display: flex;
  flex: 0 1 192px;
  flex-direction: column;
  gap: ${PILL_GAP}px;
  min-width: 0;
`;

const StyledSideHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  height: 15px;
`;

const StyledTwentyLogo = styled.img`
  border-radius: 2px;
  height: 12px;
  width: 12px;
`;

const StyledPill = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['1.5']};
  height: ${PILL_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
  position: relative;
  white-space: nowrap;

  &::after {
    background-color: ${themeCssVariables.background.primary};
    border: 1px solid ${themeCssVariables.border.color.strong};
    border-radius: ${themeCssVariables.border.radius.rounded};
    box-sizing: border-box;
    content: '';
    height: 7px;
    position: absolute;
    top: calc(50% - 3.5px);
    width: 7px;
  }

  &[data-side='source'] {
    background-color: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.secondary};
    font-family: ${themeCssVariables.code.font.family};
    font-size: ${themeCssVariables.font.size.xs};
  }

  &[data-side='source']::after {
    right: -4px;
  }

  &[data-side='target']::after {
    left: -4px;
  }
`;

const StyledPillLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledObjectLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-left: auto;
`;

const StyledWires = styled.svg`
  flex: 1 1 auto;
  height: ${WIRES_HEIGHT}px;
  margin-top: calc(15px + ${PILL_GAP}px);
  min-width: ${themeCssVariables.spacing[6]};
`;

export const GettingStartedImportPreview = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <GettingStartedStepPreview
      note={t`AI matches your columns to fields, even renamed ones.`}
      NoteIcon={IconSparkles}
      isDotted
    >
      <StyledMapping>
        <StyledSide>
          <StyledSideHeader>
            <IconFile size={theme.icon.size.sm} />
            {doNotTranslate('hubspot-export.csv')}
          </StyledSideHeader>
          {SOURCE_COLUMNS.map((column) => (
            <StyledPill key={column} data-side="source">
              <StyledPillLabel>{column}</StyledPillLabel>
            </StyledPill>
          ))}
        </StyledSide>
        <StyledWires
          viewBox={`0 0 100 ${WIRES_HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {WIRES.map(({ sourceIndex, targetIndex }) => {
            const sourceY = getPillCenter(sourceIndex);
            const targetY = getPillCenter(targetIndex);

            return (
              <path
                key={sourceIndex}
                d={`M0 ${sourceY} C50 ${sourceY}, 50 ${targetY}, 100 ${targetY}`}
                stroke={themeCssVariables.border.color.strong}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </StyledWires>
        <StyledSide>
          <StyledSideHeader>
            <StyledTwentyLogo
              src="/images/integrations/twenty-logo.svg"
              alt=""
            />
            {t`Twenty fields`}
          </StyledSideHeader>
          {TARGET_FIELDS.map((field) => (
            <StyledPill key={field.id} data-side="target">
              <field.Icon
                size={theme.icon.size.sm}
                color={themeCssVariables.font.color.tertiary}
              />
              <StyledPillLabel>{t(field.label)}</StyledPillLabel>
              <StyledObjectLabel>{t(field.objectLabel)}</StyledObjectLabel>
            </StyledPill>
          ))}
        </StyledSide>
      </StyledMapping>
      <GettingStartedStepPreviewBadge top={92}>
        <IconSparkles
          size={theme.icon.size.md}
          color={themeCssVariables.color.purple11}
        />
      </GettingStartedStepPreviewBadge>
    </GettingStartedStepPreview>
  );
};
