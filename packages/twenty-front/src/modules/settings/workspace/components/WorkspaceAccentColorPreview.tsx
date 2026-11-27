import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import {
  IconBuildingSkyscraper,
  IconLink,
  IconPlus,
  IconUserCircle,
} from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { SETTINGS_COVER_HEIGHT } from '@/settings/constants/SettingsCoverHeight';
import { WORKSPACE_COVER_HALFTONE_TOP_OFFSET } from '@/settings/workspace/constants/WorkspaceCoverHalftoneTopOffset';
import WorkspaceCoverHalftone from '@/settings/workspace/assets/workspace-cover-halftone.svg';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const PREVIEW_ROWS = [
  {
    company: doNotTranslate('Anthropic'),
    domain: doNotTranslate('anthropic.com'),
    owner: doNotTranslate('Tim Apple'),
    isSelected: true,
  },
  {
    company: doNotTranslate('OpenAI'),
    domain: doNotTranslate('openai.com'),
    owner: doNotTranslate('Phil Schiler'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Google'),
    domain: doNotTranslate('google.com'),
    owner: doNotTranslate('Jony Ive'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Stripe'),
    domain: doNotTranslate('stripe.com'),
    owner: doNotTranslate('Tim Apple'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Figma'),
    domain: doNotTranslate('figma.com'),
    owner: doNotTranslate('Phil Schiler'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Notion'),
    domain: doNotTranslate('notion.so'),
    owner: doNotTranslate('Jony Ive'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Linear'),
    domain: doNotTranslate('linear.app'),
    owner: doNotTranslate('Tim Apple'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Vercel'),
    domain: doNotTranslate('vercel.com'),
    owner: doNotTranslate('Phil Schiler'),
    isSelected: false,
  },
  {
    company: doNotTranslate('Airbnb'),
    domain: doNotTranslate('airbnb.com'),
    owner: doNotTranslate('Jony Ive'),
    isSelected: false,
  },
];

const StyledFrame = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  height: ${SETTINGS_COVER_HEIGHT}px;
  overflow: hidden;
  padding-inline: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[6]};
  position: relative;
`;

const StyledHalftone = styled.div`
  aspect-ratio: 692 / 448;
  background: ${themeCssVariables.background.tertiary};
  inset-inline: 0;
  mask-size: 100% 100%;
  position: absolute;
  top: ${WORKSPACE_COVER_HALFTONE_TOP_OFFSET}px;
`;

const StyledWindow = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom: none;
  border-start-end-radius: ${themeCssVariables.border.radius.md};
  border-start-start-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const StyledTableBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const StyledBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`;

const StyledPageBar = styled(StyledBar)`
  height: ${themeCssVariables.spacing[10]};
  padding-inline: ${themeCssVariables.spacing[2]};
`;

const StyledPageTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTableRow = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.accent.quaternary : 'transparent'};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: ${themeCssVariables.spacing[10]} repeat(
      3,
      minmax(0, 1fr)
    );
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledCell = styled.div`
  align-items: center;
  border-inline-end: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding-inline: ${themeCssVariables.spacing[2]};

  &:first-child {
    justify-content: center;
    padding-inline: 0;
  }

  &:last-child {
    border-inline-end: none;
  }
`;

export const WorkspaceAccentColorPreview = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return (
    <StyledFrame aria-hidden>
      <StyledHalftone style={{ maskImage: `url(${WorkspaceCoverHalftone})` }} />
      <StyledWindow>
        <StyledPageBar>
          <StyledPageTitle>
            <Avatar
              name={currentWorkspace?.displayName || ''}
              colorSeed={getWorkspaceAvatarColorSeed(
                currentWorkspace?.displayName,
              )}
              src={getAbsoluteImageUrl(
                currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
              )}
            />
            {currentWorkspace?.displayName}
          </StyledPageTitle>
          <Button
            size="sm"
            variant="solid"
            color="accent"
            startIcon={<IconPlus />}
            tabIndex={-1}
          >
            {t`Create`}
          </Button>
        </StyledPageBar>
        <StyledTableRow isSelected={false}>
          <StyledCell>
            <Checkbox size="sm" indeterminate readOnly tabIndex={-1} />
          </StyledCell>
          <StyledCell>
            <IconBuildingSkyscraper size={theme.icon.size.sm} />
            {t`Name`}
          </StyledCell>
          <StyledCell>
            <IconLink size={theme.icon.size.sm} />
            {t`Domain`}
          </StyledCell>
          <StyledCell>
            <IconUserCircle size={theme.icon.size.sm} />
            {t`Account Owner`}
          </StyledCell>
        </StyledTableRow>
        <StyledTableBody>
          {PREVIEW_ROWS.map(({ company, domain, owner, isSelected }) => (
            <StyledTableRow key={company} isSelected={isSelected}>
              <StyledCell>
                <Checkbox
                  size="sm"
                  checked={isSelected}
                  readOnly
                  tabIndex={-1}
                />
              </StyledCell>
              <StyledCell>
                <Chip
                  variant="soft"
                  startElement={
                    <Avatar
                      src={getLogoUrlFromDomainName(domain)}
                      name={company}
                      colorSeed={company}
                      size="sm"
                      shape="square"
                    />
                  }
                >
                  {company}
                </Chip>
              </StyledCell>
              <StyledCell>
                <Chip variant="outline" shape="round">
                  {domain}
                </Chip>
              </StyledCell>
              <StyledCell>
                <Chip
                  variant="plain"
                  startElement={
                    <Avatar
                      name={owner}
                      colorSeed={owner}
                      size="sm"
                      shape="circle"
                    />
                  }
                >
                  {owner}
                </Chip>
              </StyledCell>
            </StyledTableRow>
          ))}
        </StyledTableBody>
      </StyledWindow>
    </StyledFrame>
  );
};
