import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import {
  H2Title,
  IconLock,
  IconTool,
  MAIN_COLORS,
  Section,
  Tag,
} from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { useExpandedHeightAnimation } from '@/settings/hooks/useExpandedHeightAnimation';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityOptionsList } from '@/settings/security/components/SettingsSecurityOptionsList';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';

const StyledIconContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  display: flex;
  left: ${({ theme }) => theme.spacing(-6)};
  position: absolute;
  height: 100%;
`;

const StyledIconTool = styled(IconTool)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledAdvancedContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 100%;
`;

const StyledContainer = styled.div`
  width: 100%;
`;

export const SettingsSecurity = () => {
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const { contentRef, motionAnimationVariants } = useExpandedHeightAnimation(
    isAdvancedModeEnabled,
  );

  return (
    <SubMenuTopBarContainer
      title="Security"
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Security' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="SSO"
            description="Configure an SSO connection"
            addornment={
              <Tag
                text={'Enterprise'}
                color={'transparent'}
                Icon={IconLock}
                variant={'border'}
              />
            }
          />
          <SettingsSSOIdentitiesProvidersListCard />
        </Section>
        <Section>
          <AnimatePresence>
            {isAdvancedModeEnabled && (
              <motion.div
                ref={contentRef}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={motionAnimationVariants}
              >
                <StyledAdvancedContainer>
                  <StyledIconContainer>
                    <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
                  </StyledIconContainer>
                  <StyledContainer>
                    <H2Title
                      title="Other"
                      description="Customize your workspace security"
                    />
                    <SettingsSecurityOptionsList />
                  </StyledContainer>
                </StyledAdvancedContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
