import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconForbid, IconPlus, IconTrash } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordChip } from '@/object-record/components/RecordChip';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const ADD_PERSON_DROPDOWN_ID = 'email-lists-add-person';

const MEMBERS_GRID_COLUMNS = '1fr 1fr 120px 24px';

type EmailListRecord = ObjectRecord & { name: string | null };

type SubscriptionPersonRecord = ObjectRecord & {
  emails: { primaryEmail: string | null } | null;
};

type SubscriptionRecord = ObjectRecord & {
  status: string;
  personId: string;
  listId: string;
  person: SubscriptionPersonRecord | null;
};

const StyledCreateRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledCreateInput = styled.div`
  flex: 1;
`;

const StyledMembers = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledAddPersonRow = styled.div`
  display: flex;
`;

export const SettingsWorkspaceEmailListsSection = () => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

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
        avatarUrl: true,
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

    const createdList = await createList({ name });

    setNewListName('');

    if (isDefined(createdList)) {
      setSelectedListId(createdList.id);
    }
  };

  const handlePersonSelected = (
    pickedPerson: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (isDefined(pickedPerson) && isDefined(selectedListId)) {
      createSubscription({
        personId: pickedPerson.recordId,
        listId: selectedListId,
        status: 'SUBSCRIBED',
      });
    }

    closeDropdown(ADD_PERSON_DROPDOWN_ID);
  };

  const listOptions = emailLists.map((list) => ({
    label: list.name ?? t`Untitled list`,
    value: list.id,
  }));

  return (
    <Section>
      <H2Title
        title={t`Email Lists`}
        description={t`Curate audiences for marketing emails. Add people to a list, then target the list in a campaign.`}
      />

      <StyledCreateRow>
        <StyledCreateInput>
          <SettingsTextInput
            instanceId="email-lists-new-name"
            placeholder={t`New list name`}
            value={newListName}
            onChange={setNewListName}
            fullWidth
          />
        </StyledCreateInput>
        <Button title={t`Create list`} onClick={handleCreateList} />
      </StyledCreateRow>

      <Select
        dropdownId="email-lists-select"
        label={t`List`}
        fullWidth
        value={selectedListId}
        options={listOptions}
        emptyOption={{ label: t`Select a list`, value: '' }}
        onChange={setSelectedListId}
      />

      {isDefined(selectedListId) && (
        <StyledMembers>
          <StyledAddPersonRow>
            <Dropdown
              dropdownId={ADD_PERSON_DROPDOWN_ID}
              dropdownPlacement="bottom-start"
              clickableComponent={
                <Button
                  title={t`Add person`}
                  Icon={IconPlus}
                  variant="secondary"
                  size="small"
                />
              }
              dropdownComponents={
                <SingleRecordPicker
                  componentInstanceId={ADD_PERSON_DROPDOWN_ID}
                  focusId={ADD_PERSON_DROPDOWN_ID}
                  objectNameSingulars={['person']}
                  onMorphItemSelected={handlePersonSelected}
                  onCancel={() => closeDropdown(ADD_PERSON_DROPDOWN_ID)}
                  EmptyIcon={IconForbid}
                  emptyLabel={t`No people`}
                  layoutDirection="search-bar-on-top"
                />
              }
            />
          </StyledAddPersonRow>

          {subscriptions.length > 0 && (
            <Table>
              <TableRow gridAutoColumns={MEMBERS_GRID_COLUMNS}>
                <TableHeader>{t`Person`}</TableHeader>
                <TableHeader>{t`Email`}</TableHeader>
                <TableHeader>{t`Status`}</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow
                    key={subscription.id}
                    gridAutoColumns={MEMBERS_GRID_COLUMNS}
                  >
                    <TableCell>
                      {isDefined(subscription.person) && (
                        <RecordChip
                          objectNameSingular="person"
                          record={subscription.person}
                        />
                      )}
                    </TableCell>
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
