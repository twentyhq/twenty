import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronRight,
  IconForbid,
  IconTrash,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type EmailListRecord = ObjectRecord & { name: string | null };

type PersonRecord = ObjectRecord & {
  name: { firstName: string | null; lastName: string | null } | null;
  emails: { primaryEmail: string | null } | null;
};

type SubscriptionRecord = ObjectRecord & {
  status: string;
  personId: string;
  listId: string;
  person: PersonRecord | null;
};

const StyledRow = styled.div<{ active?: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledInputRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledFlex = styled.div`
  flex: 1;
`;

const StyledMembers = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

const personName = (person: PersonRecord | null): string => {
  const first = person?.name?.firstName ?? '';
  const last = person?.name?.lastName ?? '';
  const full = `${first} ${last}`.trim();

  return full.length > 0 ? full : (person?.emails?.primaryEmail ?? 'Unknown');
};

export const SettingsWorkspaceEmailListsSection = () => {
  const { t } = useLingui();

  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { records: emailLists } = useFindManyRecords<EmailListRecord>({
    objectNameSingular: 'emailList',
  });

  const { records: subscriptions } = useFindManyRecords<SubscriptionRecord>({
    objectNameSingular: 'emailListSubscription',
    skip: !isDefined(selectedListId),
    filter: { listId: { eq: selectedListId ?? '' } },
    recordGqlFields: {
      id: true,
      status: true,
      person: {
        id: true,
        name: { firstName: true, lastName: true },
        emails: { primaryEmail: true },
      },
    },
  });

  const { createOneRecord: createList } = useCreateOneRecord<EmailListRecord>({
    objectNameSingular: 'emailList',
  });
  const { createOneRecord: createSubscription } =
    useCreateOneRecord<SubscriptionRecord>({
      objectNameSingular: 'emailListSubscription',
    });
  const { deleteOneRecord: deleteSubscription } = useDeleteOneRecord({
    objectNameSingular: 'emailListSubscription',
  });

  const handleCreateList = async () => {
    const name = newListName.trim();

    if (name.length === 0) {
      return;
    }

    const created = await createList({ name });

    setNewListName('');

    if (isDefined(created)) {
      setSelectedListId(created.id);
    }
  };

  const handleAddPerson = async (personId: string) => {
    if (!isDefined(selectedListId)) {
      return;
    }

    await createSubscription({
      personId,
      listId: selectedListId,
      status: 'SUBSCRIBED',
    });
  };

  const handleMorphItemSelected = (
    item: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (isDefined(item)) {
      handleAddPerson(item.recordId);
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Email Lists`}
        description={t`Curate audiences for marketing emails. Add people to a list, then target the list in a campaign.`}
      />

      <StyledInputRow>
        <StyledFlex>
          <SettingsTextInput
            instanceId="email-lists-new-name"
            placeholder={t`New list name`}
            value={newListName}
            onChange={setNewListName}
            fullWidth
          />
        </StyledFlex>
        <Button title={t`Create list`} onClick={handleCreateList} />
      </StyledInputRow>

      {emailLists.map((list) => (
        <StyledRow
          key={list.id}
          active={list.id === selectedListId}
          onClick={() =>
            setSelectedListId(list.id === selectedListId ? null : list.id)
          }
        >
          <IconChevronRight size={14} />
          <StyledFlex>{list.name ?? t`Untitled list`}</StyledFlex>
        </StyledRow>
      ))}

      {isDefined(selectedListId) && (
        <StyledMembers>
          <SingleRecordPicker
            componentInstanceId="email-lists-add-person"
            focusId="email-lists-add-person"
            objectNameSingulars={['person']}
            onMorphItemSelected={handleMorphItemSelected}
            onCancel={() => {}}
            EmptyIcon={IconForbid}
            emptyLabel={t`No people`}
            layoutDirection="search-bar-on-top"
          />

          {subscriptions.length > 0 && (
            <Table>
              <TableRow gridAutoColumns="1fr 1fr 120px 24px">
                <TableHeader>{t`Person`}</TableHeader>
                <TableHeader>{t`Email`}</TableHeader>
                <TableHeader>{t`Status`}</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow
                    key={subscription.id}
                    gridAutoColumns="1fr 1fr 120px 24px"
                  >
                    <TableCell>{personName(subscription.person)}</TableCell>
                    <TableCell>
                      {subscription.person?.emails?.primaryEmail ?? ''}
                    </TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>
                      <IconButton
                        Icon={IconTrash}
                        size="small"
                        variant="tertiary"
                        onClick={() => deleteSubscription(subscription.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </StyledMembers>
      )}
    </Section>
  );
};
