import styled from '@emotion/styled';
import { Fragment, type ReactNode, useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { GranolaFolderPolicyIcon } from 'src/front-components/components/GranolaFolderPolicyIcon';
import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import { StyledSettingsCardTextContainer } from 'src/front-components/components/SettingsCardContentBase';
import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';
import { type GranolaFolderPolicyOption } from 'src/front-components/types/granola-folder-policy-option.type';

const StyledOptionRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledOptionTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-bottom: ${() => themeCssVariables.spacing[2]};
`;

const StyledOptionDescription = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledExpandedContent = styled.div`
  && {
    padding-top: 0;
  }
`;

type GranolaFolderPolicyRadioCardProps<TPolicy extends GranolaFolderPolicy> = {
  options: GranolaFolderPolicyOption<TPolicy>[];
  policy: TPolicy | undefined;
  expandedContentByPolicy?: Partial<Record<TPolicy, ReactNode>>;
  onChange?: (policy: TPolicy) => void;
};

export const GranolaFolderPolicyRadioCard = <
  TPolicy extends GranolaFolderPolicy,
>({
  options,
  policy,
  expandedContentByPolicy,
  onChange = () => undefined,
}: GranolaFolderPolicyRadioCardProps<TPolicy>) => {
  const groupId = useId();
  const isPolicyKnown = isDefined(policy);

  return (
    <RadioGroup
      value={policy ?? null}
      aria-busy={!isPolicyKnown}
      aria-label={isPolicyKnown ? undefined : t('Loading')}
      onValueChange={(nextPolicy) => {
        if (isDefined(nextPolicy)) {
          onChange(nextPolicy);
        }
      }}
      onKeyDown={(event) => {
        if (
          !(event.target instanceof HTMLElement) ||
          event.target.getAttribute('role') !== 'radio'
        ) {
          event.preventBaseUIHandler();
        }
      }}
    >
      <Card.Root fullWidth>
        {options.map((option, index) => {
          const radioId = `${groupId}-${index}`;
          const titleId = `${radioId}-title`;
          const descriptionId = `${radioId}-description`;

          return (
            <Fragment key={option.policy}>
              <Card.Content>
                <Card.Action
                  disabled={!isPolicyKnown}
                  render={<label htmlFor={radioId} aria-labelledby={titleId} />}
                />
                <StyledOptionRow>
                  <GranolaFolderPolicyIcon policy={option.policy} />
                  <StyledSettingsCardTextContainer>
                    <StyledOptionTitle id={titleId}>
                      {option.title}
                    </StyledOptionTitle>
                    <StyledOptionDescription id={descriptionId}>
                      {option.description}
                    </StyledOptionDescription>
                  </StyledSettingsCardTextContainer>
                  <Card.Control render={<StyledRadioContainer />}>
                    {isPolicyKnown ? (
                      <Radio
                        id={radioId}
                        value={option.policy}
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                      />
                    ) : (
                      <Loader />
                    )}
                  </Card.Control>
                </StyledOptionRow>
              </Card.Content>
              {option.policy === policy &&
                isDefined(expandedContentByPolicy?.[option.policy]) && (
                  <Card.Content render={<StyledExpandedContent />}>
                    {expandedContentByPolicy[option.policy]}
                  </Card.Content>
                )}
              {index < options.length - 1 && <SettingsCardSeparator />}
            </Fragment>
          );
        })}
      </Card.Root>
    </RadioGroup>
  );
};
