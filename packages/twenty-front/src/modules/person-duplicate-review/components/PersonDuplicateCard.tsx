import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconExternalLink } from 'twenty-ui/icon';
import { Checkbox, Radio } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type PersonDuplicatePerson } from '@/person-duplicate-review/types/PersonDuplicateReview';
import { getPersonDuplicateDisplayName } from '@/person-duplicate-review/utils/personDuplicateReview';

const StyledCard = styled.article<{ selected: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ selected }) =>
      selected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 260px;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 240px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSelectionRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledPersonHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPersonIdentity = styled.div`
  min-width: 0;
`;

const StyledName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFieldList = styled.dl`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
`;

const StyledField = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.dt`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledValue = styled.dd`
  color: ${themeCssVariables.font.color.secondary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  overflow-wrap: anywhere;
`;

const StyledRecordLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: auto;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const PersonDuplicateCard = ({
  person,
  selected,
  isBase,
  onToggleSelected,
  onSelectBase,
}: {
  person: PersonDuplicatePerson;
  selected: boolean;
  isBase: boolean;
  onToggleSelected: () => void;
  onSelectBase: () => void;
}) => {
  const displayName = getPersonDuplicateDisplayName(person);
  const recordPath = getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: 'person',
    objectRecordId: person.id,
  });

  return (
    <StyledCard selected={selected}>
      <StyledSelectionRow>
        <Checkbox
          checked={selected}
          onChange={onToggleSelected}
          aria-label={t`Include ${displayName} in merge`}
        />
        <Radio
          checked={isBase}
          disabled={!selected}
          label={isBase ? t`Survivor` : t`Keep this record`}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectBase();
            }
          }}
        />
      </StyledSelectionRow>

      <StyledPersonHeader>
        <Avatar
          avatarUrl={person.avatarUrl}
          placeholder={displayName}
          placeholderColorSeed={person.id}
          size="lg"
          type="rounded"
        />
        <StyledPersonIdentity>
          <StyledName>{displayName}</StyledName>
          <StyledSubtitle>
            {[person.jobTitle, person.company?.name]
              .filter(Boolean)
              .join(' · ') || t`No title or company`}
          </StyledSubtitle>
        </StyledPersonIdentity>
      </StyledPersonHeader>

      <StyledFieldList>
        <StyledField>
          <StyledLabel>{t`Emails`}</StyledLabel>
          <StyledValue>
            {person.emails.length > 0
              ? person.emails.map((email) => <div key={email}>{email}</div>)
              : '—'}
          </StyledValue>
        </StyledField>
        <StyledField>
          <StyledLabel>{t`Phones`}</StyledLabel>
          <StyledValue>
            {person.phones.length > 0
              ? person.phones.map((phone) => (
                  <div key={`${phone.callingCode}:${phone.number}`}>
                    {[phone.callingCode, phone.number]
                      .filter(Boolean)
                      .join(' ')}
                  </div>
                ))
              : '—'}
          </StyledValue>
        </StyledField>
        <StyledField>
          <StyledLabel>{t`LinkedIn`}</StyledLabel>
          <StyledValue>
            {person.linkedinLinks.length > 0
              ? person.linkedinLinks.map((link) => (
                  <div key={link.url}>{link.url}</div>
                ))
              : '—'}
          </StyledValue>
        </StyledField>
        <StyledField>
          <StyledLabel>{t`Owner / creator`}</StyledLabel>
          <StyledValue>{person.createdByName || '—'}</StyledValue>
        </StyledField>
        <StyledField>
          <StyledLabel>{t`Created`}</StyledLabel>
          <StyledValue>{formatDate(person.createdAt)}</StyledValue>
        </StyledField>
        <StyledField>
          <StyledLabel>{t`Last updated`}</StyledLabel>
          <StyledValue>{formatDate(person.updatedAt)}</StyledValue>
        </StyledField>
      </StyledFieldList>

      <StyledRecordLink href={recordPath} target="_blank" rel="noreferrer">
        {t`View full record`}
        <IconExternalLink size={14} />
      </StyledRecordLink>
    </StyledCard>
  );
};
