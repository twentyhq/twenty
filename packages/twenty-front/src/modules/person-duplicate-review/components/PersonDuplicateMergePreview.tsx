import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconStar } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type PersonDuplicateLink,
  type PersonDuplicatePerson,
  type PersonDuplicatePhone,
} from '@/person-duplicate-review/types/PersonDuplicateReview';
import {
  getPersonDuplicateDisplayName,
  getPersonDuplicateLinkKey,
  getPersonDuplicatePhoneKey,
} from '@/person-duplicate-review/utils/personDuplicateReview';

const StyledPreview = styled.aside`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1 1 300px;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 280px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeading = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

const StyledSection = styled.section`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledPrimaryValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledValueRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledValueText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  overflow-wrap: anywhere;
`;

const StyledPrimaryButton = styled.button<{ active: boolean }>`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${({ active }) =>
    active
      ? themeCssVariables.color.yellow
      : themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  padding: 0;
`;

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.light};
`;

export const PersonDuplicateMergePreview = ({
  basePerson,
  emails,
  phones,
  linkedinLinks,
  includedEmailKeys,
  includedPhoneKeys,
  includedLinkKeys,
  primaryEmailKey,
  primaryPhoneKey,
  primaryLinkKey,
  onToggleEmail,
  onTogglePhone,
  onToggleLink,
  onSetPrimaryEmail,
  onSetPrimaryPhone,
  onSetPrimaryLink,
}: {
  basePerson: PersonDuplicatePerson | undefined;
  emails: string[];
  phones: PersonDuplicatePhone[];
  linkedinLinks: PersonDuplicateLink[];
  includedEmailKeys: Set<string>;
  includedPhoneKeys: Set<string>;
  includedLinkKeys: Set<string>;
  primaryEmailKey: string | undefined;
  primaryPhoneKey: string | undefined;
  primaryLinkKey: string | undefined;
  onToggleEmail: (key: string) => void;
  onTogglePhone: (key: string) => void;
  onToggleLink: (key: string) => void;
  onSetPrimaryEmail: (key: string) => void;
  onSetPrimaryPhone: (key: string) => void;
  onSetPrimaryLink: (key: string) => void;
}) => (
  <StyledPreview>
    <div>
      <StyledHeading>{t`Proposed merged person`}</StyledHeading>
      <StyledDescription>
        {t`The survivor keeps its ID. Checked contact details are preserved; the star marks the primary value.`}
      </StyledDescription>
    </div>

    <StyledSection>
      <StyledSectionLabel>{t`Name`}</StyledSectionLabel>
      <StyledPrimaryValue>
        {basePerson ? getPersonDuplicateDisplayName(basePerson) : '—'}
      </StyledPrimaryValue>
    </StyledSection>

    <StyledSection>
      <StyledSectionLabel>{t`Title and current company`}</StyledSectionLabel>
      <StyledPrimaryValue>
        {[basePerson?.jobTitle, basePerson?.company?.name]
          .filter(Boolean)
          .join(' · ') || '—'}
      </StyledPrimaryValue>
      <StyledDescription>
        {t`Twenty supports one current company per person, so this comes from the chosen survivor.`}
      </StyledDescription>
    </StyledSection>

    <StyledSection>
      <StyledSectionLabel>{t`Emails`}</StyledSectionLabel>
      {emails.length === 0 ? (
        <StyledEmptyValue>—</StyledEmptyValue>
      ) : (
        emails.map((email) => {
          const key = email.trim().toLowerCase();
          const included = includedEmailKeys.has(key);

          return (
            <StyledValueRow key={key}>
              <Checkbox
                checked={included}
                onChange={() => onToggleEmail(key)}
                aria-label={t`Keep ${email}`}
              />
              <StyledValueText>{email}</StyledValueText>
              <StyledPrimaryButton
                type="button"
                active={primaryEmailKey === key}
                disabled={!included}
                onClick={() => onSetPrimaryEmail(key)}
                aria-label={t`Make ${email} primary`}
              >
                <IconStar size={16} />
              </StyledPrimaryButton>
            </StyledValueRow>
          );
        })
      )}
    </StyledSection>

    <StyledSection>
      <StyledSectionLabel>{t`Phones`}</StyledSectionLabel>
      {phones.length === 0 ? (
        <StyledEmptyValue>—</StyledEmptyValue>
      ) : (
        phones.map((phone) => {
          const key = getPersonDuplicatePhoneKey(phone);
          const included = includedPhoneKeys.has(key);
          const displayValue = [phone.callingCode, phone.number]
            .filter(Boolean)
            .join(' ');

          return (
            <StyledValueRow key={key}>
              <Checkbox
                checked={included}
                onChange={() => onTogglePhone(key)}
                aria-label={t`Keep ${displayValue}`}
              />
              <StyledValueText>{displayValue}</StyledValueText>
              <StyledPrimaryButton
                type="button"
                active={primaryPhoneKey === key}
                disabled={!included}
                onClick={() => onSetPrimaryPhone(key)}
                aria-label={t`Make ${displayValue} primary`}
              >
                <IconStar size={16} />
              </StyledPrimaryButton>
            </StyledValueRow>
          );
        })
      )}
    </StyledSection>

    <StyledSection>
      <StyledSectionLabel>{t`LinkedIn`}</StyledSectionLabel>
      {linkedinLinks.length === 0 ? (
        <StyledEmptyValue>—</StyledEmptyValue>
      ) : (
        linkedinLinks.map((link) => {
          const key = getPersonDuplicateLinkKey(link);
          const included = includedLinkKeys.has(key);

          return (
            <StyledValueRow key={key}>
              <Checkbox
                checked={included}
                onChange={() => onToggleLink(key)}
                aria-label={t`Keep ${link.url}`}
              />
              <StyledValueText>{link.url}</StyledValueText>
              <StyledPrimaryButton
                type="button"
                active={primaryLinkKey === key}
                disabled={!included}
                onClick={() => onSetPrimaryLink(key)}
                aria-label={t`Make ${link.url} primary`}
              >
                <IconStar size={16} />
              </StyledPrimaryButton>
            </StyledValueRow>
          );
        })
      )}
    </StyledSection>
  </StyledPreview>
);
