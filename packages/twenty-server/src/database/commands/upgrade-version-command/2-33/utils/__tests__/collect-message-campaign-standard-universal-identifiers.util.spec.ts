import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { collectMessageCampaignStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-33/utils/collect-message-campaign-standard-universal-identifiers.util';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('collectMessageCampaignStandardUniversalIdentifiers', () => {
  const { allFlatEntityMaps: standardAllFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: v4(),
      twentyStandardApplicationId: v4(),
    });

  const universalIdentifiers =
    collectMessageCampaignStandardUniversalIdentifiers({
      standardAllFlatEntityMaps,
    });

  it('should collect the three campaign standard objects', () => {
    expect(universalIdentifiers.objectMetadata).toEqual([
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
      STANDARD_OBJECTS.messageList.universalIdentifier,
      STANDARD_OBJECTS.messageListMember.universalIdentifier,
    ]);
  });

  it('should collect the campaign fields and the inverse relation fields living on other objects', () => {
    expect(universalIdentifiers.fieldMetadata).toContain(
      STANDARD_OBJECTS.messageCampaign.fields.name.universalIdentifier,
    );
    expect(universalIdentifiers.fieldMetadata).toContain(
      STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
    );
  });

  it('should collect the campaign index view and its view fields', () => {
    const allMessageCampaignsViewUniversalIdentifier =
      STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
        .universalIdentifier;

    expect(universalIdentifiers.view).toContain(
      allMessageCampaignsViewUniversalIdentifier,
    );
    expect(universalIdentifiers.viewField).toContain(
      STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns.viewFields
        .status.universalIdentifier,
    );
  });

  it('should collect the campaign search field metadata and every campaign index', () => {
    expect(universalIdentifiers.index).toContain(
      STANDARD_OBJECTS.messageCampaign.indexes.listIdIndex.universalIdentifier,
    );
    expect(universalIdentifiers.index).toContain(
      STANDARD_OBJECTS.messageListMember.indexes.personListUniqueIndex
        .universalIdentifier,
    );
    expect(universalIdentifiers.searchFieldMetadata.length).toBeGreaterThan(0);
  });

  it('should collect the campaign command menu items including the global compose campaign entry', () => {
    expect(universalIdentifiers.commandMenuItem).toContain(
      STANDARD_COMMAND_MENU_ITEMS.composeCampaign.universalIdentifier,
    );
    expect(universalIdentifiers.commandMenuItem).toContain(
      STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
    );
  });

  it('should not collect metadata belonging to unrelated standard objects', () => {
    const companyFieldUniversalIdentifiers = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataUniversalIdentifier ===
            STANDARD_OBJECTS.company.universalIdentifier &&
          !isDefined(
            flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
          ),
      )
      .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

    expect(companyFieldUniversalIdentifiers.length).toBeGreaterThan(0);
    expect(universalIdentifiers.fieldMetadata).toEqual(
      expect.not.arrayContaining(companyFieldUniversalIdentifiers),
    );
  });
});
