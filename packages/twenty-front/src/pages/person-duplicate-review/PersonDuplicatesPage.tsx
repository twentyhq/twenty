import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Pill } from 'twenty-ui/data-display';
import {
  IconAlertTriangle,
  IconArrowMerge,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PersonDuplicateCard } from '@/person-duplicate-review/components/PersonDuplicateCard';
import { PersonDuplicateMergePreview } from '@/person-duplicate-review/components/PersonDuplicateMergePreview';
import { KEEP_PERSON_DUPLICATE_RECORDS_SEPARATE } from '@/person-duplicate-review/graphql/personDuplicateReview';
import { usePersonDuplicateGroups } from '@/person-duplicate-review/hooks/usePersonDuplicateGroups';
import {
  type PersonDuplicateGroup,
  type PersonDuplicatePairInput,
  type PersonDuplicatePerson,
} from '@/person-duplicate-review/types/PersonDuplicateReview';
import {
  getAllPersonDuplicatePairs,
  getPersonDuplicateLinkKey,
  getPersonDuplicatePhoneKey,
  getUniquePersonDuplicateEmails,
  getUniquePersonDuplicateLinks,
  getUniquePersonDuplicatePhones,
} from '@/person-duplicate-review/utils/personDuplicateReview';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledIntro = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledIntroCopy = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIntroTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: 720px;
`;

const StyledQueueControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledReasonRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledComparison = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSourceCards = styled.div`
  display: flex;
  flex: 2 1 560px;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPermissionNotice = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledActionBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  position: sticky;
`;

const StyledActionCopy = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledConfirmation = styled.div`
  align-items: center;
  background: ${themeCssVariables.color.orange2};
  border: 1px solid ${themeCssVariables.color.orange4};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledConfirmationCopy = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

const StyledState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const toggleSetValue = (values: Set<string>, value: string): Set<string> => {
  const nextValues = new Set(values);

  if (nextValues.has(value)) {
    nextValues.delete(value);
  } else {
    nextValues.add(value);
  }

  return nextValues;
};

const getReasonLabel = (reason: string): string => {
  switch (reason) {
    case 'EMAIL':
      return t`Same email`;
    case 'LINKEDIN':
      return t`Same LinkedIn`;
    case 'PHONE':
      return t`Same phone`;
    case 'NAME':
      return t`Same full name`;
    default:
      return reason;
  }
};

export const PersonDuplicatesPage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { groups, totalCount, canResolve, loading, error, refetch } =
    usePersonDuplicateGroups();
  const { mergeManyRecords, loading: isMerging } = useMergeManyRecords({
    objectNameSingular: 'person',
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [keepSeparate, { loading: isKeepingSeparate }] = useMutation<
    { keepPersonDuplicateRecordsSeparate: boolean },
    { pairs: PersonDuplicatePairInput[] }
  >(KEEP_PERSON_DUPLICATE_RECORDS_SEPARATE, {
    client: apolloCoreClient,
  });
  const [groupIndex, setGroupIndex] = useState(0);
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(
    new Set(),
  );
  const [basePersonId, setBasePersonId] = useState<string>();
  const [includedEmailKeys, setIncludedEmailKeys] = useState<Set<string>>(
    new Set(),
  );
  const [includedPhoneKeys, setIncludedPhoneKeys] = useState<Set<string>>(
    new Set(),
  );
  const [includedLinkKeys, setIncludedLinkKeys] = useState<Set<string>>(
    new Set(),
  );
  const [primaryEmailKey, setPrimaryEmailKey] = useState<string>();
  const [primaryPhoneKey, setPrimaryPhoneKey] = useState<string>();
  const [primaryLinkKey, setPrimaryLinkKey] = useState<string>();
  const [isConfirmingMerge, setIsConfirmingMerge] = useState(false);

  const safeGroupIndex = Math.min(groupIndex, Math.max(groups.length - 1, 0));
  const currentGroup: PersonDuplicateGroup | undefined =
    groups.at(safeGroupIndex);

  useEffect(() => {
    if (!isDefined(currentGroup)) {
      return;
    }

    const allEmails = getUniquePersonDuplicateEmails(currentGroup.people);
    const allPhones = getUniquePersonDuplicatePhones(currentGroup.people);
    const allLinks = getUniquePersonDuplicateLinks(currentGroup.people);
    const firstPerson = currentGroup.people[0];
    const firstPhone = firstPerson?.phones[0];
    const firstLink = firstPerson?.linkedinLinks[0];
    const fallbackPhone = allPhones[0];
    const fallbackLink = allLinks[0];

    setSelectedPersonIds(
      new Set(currentGroup.people.map((person) => person.id)),
    );
    setBasePersonId(firstPerson?.id);
    setIncludedEmailKeys(
      new Set(allEmails.map((email) => email.toLowerCase())),
    );
    setIncludedPhoneKeys(new Set(allPhones.map(getPersonDuplicatePhoneKey)));
    setIncludedLinkKeys(new Set(allLinks.map(getPersonDuplicateLinkKey)));
    setPrimaryEmailKey(
      firstPerson?.emails[0]?.trim().toLowerCase() ??
        allEmails[0]?.toLowerCase(),
    );
    setPrimaryPhoneKey(
      isDefined(firstPhone)
        ? getPersonDuplicatePhoneKey(firstPhone)
        : isDefined(fallbackPhone)
          ? getPersonDuplicatePhoneKey(fallbackPhone)
          : undefined,
    );
    setPrimaryLinkKey(
      isDefined(firstLink)
        ? getPersonDuplicateLinkKey(firstLink)
        : isDefined(fallbackLink)
          ? getPersonDuplicateLinkKey(fallbackLink)
          : undefined,
    );
    setIsConfirmingMerge(false);
  }, [currentGroup]);

  const selectedPeople = useMemo(
    () =>
      currentGroup?.people.filter(({ id }) => selectedPersonIds.has(id)) ?? [],
    [currentGroup, selectedPersonIds],
  );
  const basePerson = currentGroup?.people.find(({ id }) => id === basePersonId);
  const availableEmails = useMemo(
    () => getUniquePersonDuplicateEmails(selectedPeople),
    [selectedPeople],
  );
  const availablePhones = useMemo(
    () => getUniquePersonDuplicatePhones(selectedPeople),
    [selectedPeople],
  );
  const availableLinks = useMemo(
    () => getUniquePersonDuplicateLinks(selectedPeople),
    [selectedPeople],
  );
  const includedEmails = availableEmails.filter((email) =>
    includedEmailKeys.has(email.trim().toLowerCase()),
  );
  const includedPhones = availablePhones.filter((phone) =>
    includedPhoneKeys.has(getPersonDuplicatePhoneKey(phone)),
  );
  const includedLinks = availableLinks.filter((link) =>
    includedLinkKeys.has(getPersonDuplicateLinkKey(link)),
  );
  const effectivePrimaryEmailKey =
    includedEmails
      .find((email) => email.trim().toLowerCase() === primaryEmailKey)
      ?.trim()
      .toLowerCase() ?? includedEmails[0]?.trim().toLowerCase();
  const effectivePrimaryPhoneKey = includedPhones.find(
    (phone) => getPersonDuplicatePhoneKey(phone) === primaryPhoneKey,
  )
    ? primaryPhoneKey
    : isDefined(includedPhones[0])
      ? getPersonDuplicatePhoneKey(includedPhones[0])
      : undefined;
  const effectivePrimaryLinkKey = includedLinks.find(
    (link) => getPersonDuplicateLinkKey(link) === primaryLinkKey,
  )
    ? primaryLinkKey
    : isDefined(includedLinks[0])
      ? getPersonDuplicateLinkKey(includedLinks[0])
      : undefined;
  const isResolving = isMerging || isKeepingSeparate;

  const selectBasePerson = (person: PersonDuplicatePerson) => {
    setBasePersonId(person.id);

    if (isDefined(person.emails[0])) {
      setPrimaryEmailKey(person.emails[0].trim().toLowerCase());
    }
    if (isDefined(person.phones[0])) {
      setPrimaryPhoneKey(getPersonDuplicatePhoneKey(person.phones[0]));
    }
    if (isDefined(person.linkedinLinks[0])) {
      setPrimaryLinkKey(getPersonDuplicateLinkKey(person.linkedinLinks[0]));
    }
  };

  const toggleSelectedPerson = (person: PersonDuplicatePerson) => {
    setSelectedPersonIds((currentIds) => {
      const nextIds = toggleSetValue(currentIds, person.id);

      if (person.id === basePersonId && !nextIds.has(person.id)) {
        const nextBasePerson = currentGroup?.people.find(({ id }) =>
          nextIds.has(id),
        );

        setBasePersonId(nextBasePerson?.id);
      }

      return nextIds;
    });
    setIsConfirmingMerge(false);
  };

  const handleKeepSeparate = async () => {
    if (!isDefined(currentGroup)) {
      return;
    }

    try {
      await keepSeparate({
        variables: {
          pairs: getAllPersonDuplicatePairs(currentGroup.people),
        },
      });
      await refetch();
      enqueueSuccessSnackBar({
        message: t`These people will remain separate unless their identity details change.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`The keep-separate decision could not be saved.`,
      });
    }
  };

  const handleConfirmMerge = async () => {
    if (
      !isDefined(currentGroup) ||
      !isDefined(basePersonId) ||
      selectedPeople.length < 2
    ) {
      return;
    }

    const primaryEmail =
      includedEmails.find(
        (email) => email.trim().toLowerCase() === effectivePrimaryEmailKey,
      ) ?? '';
    const primaryPhone = includedPhones.find(
      (phone) => getPersonDuplicatePhoneKey(phone) === effectivePrimaryPhoneKey,
    );
    const primaryLink = includedLinks.find(
      (link) => getPersonDuplicateLinkKey(link) === effectivePrimaryLinkKey,
    );
    const overrideData: Partial<ObjectRecord> = {
      emails: {
        primaryEmail,
        additionalEmails: includedEmails.filter(
          (email) => email !== primaryEmail,
        ),
      },
      phones: {
        primaryPhoneNumber: primaryPhone?.number ?? '',
        primaryPhoneCountryCode: primaryPhone?.countryCode ?? '',
        primaryPhoneCallingCode: primaryPhone?.callingCode ?? '',
        additionalPhones: includedPhones.filter(
          (phone) =>
            getPersonDuplicatePhoneKey(phone) !== effectivePrimaryPhoneKey,
        ),
      },
      linkedinLink: {
        primaryLinkLabel: primaryLink?.label ?? '',
        primaryLinkUrl: primaryLink?.url ?? '',
        secondaryLinks: includedLinks.filter(
          (link) => getPersonDuplicateLinkKey(link) !== effectivePrimaryLinkKey,
        ),
      },
    };
    const recordIds = selectedPeople.map(({ id }) => id);
    const excludedPeople = currentGroup.people.filter(
      ({ id }) => !selectedPersonIds.has(id),
    );

    try {
      const mergedPerson = await mergeManyRecords({
        recordIds,
        mergeSettings: {
          conflictPriorityIndex: recordIds.indexOf(basePersonId),
        },
        overrideData,
      });

      if (!mergedPerson) {
        throw new Error('Merge returned no person.');
      }

      if (excludedPeople.length > 0) {
        await keepSeparate({
          variables: {
            pairs: excludedPeople.map(({ id }) => ({
              leftPersonId: basePersonId,
              rightPersonId: id,
            })),
          },
        });
      }

      await refetch();
      enqueueSuccessSnackBar({
        message: t`People merged. Absorbed records are available in Trash.`,
      });
      setIsConfirmingMerge(false);
    } catch {
      enqueueErrorSnackBar({
        message: t`The people could not be merged.`,
      });
    }
  };

  if (loading && groups.length === 0) {
    return (
      <PageContainer>
        <PageHeader title={t`Duplicates`} Icon={IconCopy} />
        <StyledState>{t`Looking for exact duplicate signals…`}</StyledState>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t`Duplicates`} Icon={IconCopy} />
        <StyledState>
          <IconAlertTriangle size={24} />
          {t`The duplicate queue could not be loaded.`}
        </StyledState>
      </PageContainer>
    );
  }

  if (!isDefined(currentGroup)) {
    return (
      <PageContainer>
        <PageHeader title={t`Duplicates`} Icon={IconCopy} />
        <StyledState>
          <IconCopy size={32} />
          <div>{t`No unresolved duplicate groups`}</div>
          <StyledDescription>
            {t`New exact matches on full name, email, phone, or LinkedIn will appear here. No records are merged automatically.`}
          </StyledDescription>
        </StyledState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t`Duplicates`} Icon={IconCopy} />
      <StyledPageBody>
        <StyledIntro>
          <StyledIntroCopy>
            <StyledIntroTitle>{t`Review possible duplicate people`}</StyledIntroTitle>
            <StyledDescription>
              {t`Compare the source records and decide. Twenty never merges or separates people without your choice.`}
            </StyledDescription>
          </StyledIntroCopy>
          <StyledQueueControls>
            <Button
              Icon={IconChevronLeft}
              title={t`Previous`}
              size="small"
              variant="secondary"
              disabled={safeGroupIndex === 0}
              onClick={() =>
                setGroupIndex((currentIndex) => Math.max(currentIndex - 1, 0))
              }
            />
            <span>
              {safeGroupIndex + 1} of {totalCount}
            </span>
            <Button
              Icon={IconChevronRight}
              title={t`Next`}
              size="small"
              variant="secondary"
              disabled={safeGroupIndex >= groups.length - 1}
              onClick={() =>
                setGroupIndex((currentIndex) =>
                  Math.min(currentIndex + 1, groups.length - 1),
                )
              }
            />
          </StyledQueueControls>
        </StyledIntro>

        <StyledReasonRow>
          <span>{t`Why this was surfaced:`}</span>
          {currentGroup.reasons.map((reason) => (
            <Pill key={reason} label={getReasonLabel(reason)} />
          ))}
        </StyledReasonRow>

        {!canResolve && (
          <StyledPermissionNotice>
            <IconAlertTriangle size={18} />
            {t`You can review this queue, but People edit and delete permissions are required to merge or keep records separate.`}
          </StyledPermissionNotice>
        )}

        <StyledComparison>
          <StyledSourceCards>
            {currentGroup.people.map((person) => (
              <PersonDuplicateCard
                key={person.id}
                person={person}
                selected={selectedPersonIds.has(person.id)}
                isBase={basePersonId === person.id}
                onToggleSelected={() => toggleSelectedPerson(person)}
                onSelectBase={() => selectBasePerson(person)}
              />
            ))}
          </StyledSourceCards>

          <PersonDuplicateMergePreview
            basePerson={basePerson}
            emails={availableEmails}
            phones={availablePhones}
            linkedinLinks={availableLinks}
            includedEmailKeys={includedEmailKeys}
            includedPhoneKeys={includedPhoneKeys}
            includedLinkKeys={includedLinkKeys}
            primaryEmailKey={effectivePrimaryEmailKey}
            primaryPhoneKey={effectivePrimaryPhoneKey}
            primaryLinkKey={effectivePrimaryLinkKey}
            onToggleEmail={(key) =>
              setIncludedEmailKeys((keys) => toggleSetValue(keys, key))
            }
            onTogglePhone={(key) =>
              setIncludedPhoneKeys((keys) => toggleSetValue(keys, key))
            }
            onToggleLink={(key) =>
              setIncludedLinkKeys((keys) => toggleSetValue(keys, key))
            }
            onSetPrimaryEmail={setPrimaryEmailKey}
            onSetPrimaryPhone={setPrimaryPhoneKey}
            onSetPrimaryLink={setPrimaryLinkKey}
          />
        </StyledComparison>

        {isConfirmingMerge && (
          <StyledConfirmation>
            <StyledConfirmationCopy>
              <IconAlertTriangle size={20} />
              <span>
                {t`Confirm merge: the chosen survivor keeps its ID and the reviewed contact details. The other selected records move to Trash with their email fields cleared; restoring them later will not move relationships back.`}
              </span>
            </StyledConfirmationCopy>
            <StyledActions>
              <Button
                title={t`Cancel`}
                variant="secondary"
                size="small"
                disabled={isResolving}
                onClick={() => setIsConfirmingMerge(false)}
              />
              <Button
                title={isMerging ? t`Merging…` : t`Confirm merge`}
                variant="primary"
                accent="blue"
                size="small"
                Icon={IconArrowMerge}
                disabled={isResolving}
                onClick={handleConfirmMerge}
              />
            </StyledActions>
          </StyledConfirmation>
        )}

        <StyledActionBar>
          <StyledActionCopy>
            {selectedPeople.length} of {currentGroup.people.length} selected.
            {selectedPeople.length < 2 &&
              ` ${t`Select at least two people to merge.`}`}
          </StyledActionCopy>
          <StyledActions>
            <Button
              title={isKeepingSeparate ? t`Saving…` : t`Keep everyone separate`}
              variant="secondary"
              size="medium"
              disabled={!canResolve || isResolving}
              onClick={handleKeepSeparate}
            />
            <Button
              title={t`Merge selected`}
              variant="primary"
              accent="blue"
              size="medium"
              Icon={IconArrowMerge}
              disabled={
                !canResolve ||
                isResolving ||
                selectedPeople.length < 2 ||
                !isDefined(basePersonId)
              }
              onClick={() => setIsConfirmingMerge(true)}
            />
          </StyledActions>
        </StyledActionBar>
      </StyledPageBody>
    </PageContainer>
  );
};
