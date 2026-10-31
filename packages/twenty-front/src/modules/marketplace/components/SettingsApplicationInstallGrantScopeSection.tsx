import { IconLock } from 'twenty-ui/icon';
import { type GrantObjectScope } from '@/marketplace/types/GrantObjectScope';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ObjectPermissionAction } from 'twenty-shared/application';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsApplicationInstallGrantScopeSectionProps = {
  appObjectUniversalIdentifiers: Set<string>;
  requiredObjectUniversalIdentifiersByAction: Partial<
    Record<ObjectPermissionAction, Set<string>>
  >;
  scopes: GrantObjectScope[];
  onScopesChange: (scopes: GrantObjectScope[]) => void;
};

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledScope = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledObjectList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  max-height: 180px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledObjectRow = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} 0;

  &[data-disabled='true'] {
    cursor: default;
  }
`;

const getActionLabel = (action: ObjectPermissionAction) => {
  switch (action) {
    case 'canReadObjectRecords':
      return t`Read records of`;
    case 'canUpdateObjectRecords':
      return t`Update records of`;
    case 'canSoftDeleteObjectRecords':
      return t`Delete records of`;
    case 'canDestroyObjectRecords':
      return t`Permanently destroy records of`;
  }
};

export const SettingsApplicationInstallGrantScopeSection = ({
  appObjectUniversalIdentifiers,
  requiredObjectUniversalIdentifiersByAction,
  scopes,
  onScopesChange,
}: SettingsApplicationInstallGrantScopeSectionProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const selectableObjectMetadataItems = objectMetadataItems
    .filter(
      (objectMetadataItem) =>
        objectMetadataItem.isActive &&
        !objectMetadataItem.isSystem &&
        !appObjectUniversalIdentifiers.has(
          objectMetadataItem.universalIdentifier,
        ),
    )
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const updateScope = (
    action: ObjectPermissionAction,
    update: Partial<GrantObjectScope>,
  ) =>
    onScopesChange(
      scopes.map((scope) =>
        scope.action === action ? { ...scope, ...update } : scope,
      ),
    );

  const toggleObject = (scope: GrantObjectScope, objectMetadataId: string) =>
    updateScope(scope.action, {
      objectMetadataIds: scope.objectMetadataIds.includes(objectMetadataId)
        ? scope.objectMetadataIds.filter((id) => id !== objectMetadataId)
        : [...scope.objectMetadataIds, objectMetadataId],
    });

  return (
    <StyledSection>
      {scopes.map((scope) => (
        <StyledScope key={scope.action}>
          <Select
            dropdownId={`grant-scope-${scope.action}`}
            label={getActionLabel(scope.action)}
            fullWidth
            dropdownWidthAuto
            value={scope.allObjects ? 'all' : 'some'}
            options={[
              { value: 'all', label: t`All objects (including future ones)` },
              { value: 'some', label: t`Only these objects` },
            ]}
            onChange={(value) =>
              updateScope(scope.action, { allObjects: value === 'all' })
            }
          />
          {!scope.allObjects && (
            <StyledObjectList>
              {selectableObjectMetadataItems.map((objectMetadataItem) => {
                // Already granted: the app requires this action on the object
                const isRequired =
                  requiredObjectUniversalIdentifiersByAction[scope.action]?.has(
                    objectMetadataItem.universalIdentifier,
                  ) ?? false;

                return (
                  <StyledObjectRow
                    key={objectMetadataItem.id}
                    data-disabled={isRequired}
                    title={isRequired ? t`Required by the app` : undefined}
                  >
                    <Checkbox
                      checked={
                        isRequired ||
                        scope.objectMetadataIds.includes(objectMetadataItem.id)
                      }
                      disabled={isRequired}
                      onCheckedChange={() =>
                        toggleObject(scope, objectMetadataItem.id)
                      }
                    />
                    {objectMetadataItem.labelPlural}
                    {isRequired && (
                      <IconLock
                        size={14}
                        color={themeCssVariables.font.color.tertiary}
                        aria-label={t`Required by the app`}
                      />
                    )}
                  </StyledObjectRow>
                );
              })}
            </StyledObjectList>
          )}
        </StyledScope>
      ))}
    </StyledSection>
  );
};
