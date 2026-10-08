import { createConsolidatedAccountChannelsQueryOrThrow } from '@/settings/accounts/utils/createConsolidatedAccountChannelsQueryOrThrow';
import { Kind, print } from 'graphql';

describe('createConsolidatedAccountChannelsQueryOrThrow', () => {
  it('loads both channel bindings in one query bounded to the supplied physical IDs', () => {
    const { query, variables } = createConsolidatedAccountChannelsQueryOrThrow([
      'own-id',
      'shared-id',
    ]);
    const operation = query.definitions.find(
      (definition) => definition.kind === Kind.OPERATION_DEFINITION,
    );

    expect(variables).toEqual({
      connectedAccountId0: 'own-id',
      connectedAccountId1: 'shared-id',
    });
    expect(operation?.selectionSet.selections).toHaveLength(4);
    expect(print(query)).toContain(
      'messageChannels0: myMessageChannels(connectedAccountId: $connectedAccountId0)',
    );
    expect(print(query)).toContain(
      'calendarChannels1: myCalendarChannels(connectedAccountId: $connectedAccountId1)',
    );
    expect(print(query)).toContain('$connectedAccountId0: UUID!');
    expect(print(query)).toContain('messageFolderImportPolicy');
    expect(print(query)).not.toContain('own-id');
    expect(print(query)).not.toContain('shared-id');
  });

  it('does not send a broad channel query for no native connections', () => {
    const { query, variables } = createConsolidatedAccountChannelsQueryOrThrow(
      [],
    );

    expect(variables).toEqual({});
    expect(print(query)).not.toContain('myMessageChannels');
    expect(print(query)).not.toContain('myCalendarChannels');
  });
});
