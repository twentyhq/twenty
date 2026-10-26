import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { saveAs } from 'file-saver';
import { useRef, useState, type ChangeEvent } from 'react';
import { parseRecordPermissionPolicy } from 'twenty-shared/utils';
import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { useToast } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { useRecordPermissionPolicy } from '@/settings/record-permissions/hooks/useRecordPermissionPolicy';

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;
const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type RecordPermissionPolicyTransferProps = {
  disabled: boolean;
  exportedDefinition?: RecordPermissionPolicyDefinition;
};

export const RecordPermissionPolicyTransfer = ({
  disabled,
  exportedDefinition,
}: RecordPermissionPolicyTransferProps) => {
  const { definition, updateDefinition } = useRecordPermissionPolicy();
  const definitionToExport = exportedDefinition ?? definition;
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { enqueueToast } = useToast();
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error('Permission file is too large');
      const imported = parseRecordPermissionPolicy(
        JSON.parse(await file.text()),
      );
      updateDefinition(() => imported);
      enqueueToast({
        status: 'success',
        children: t`Permissions imported into your draft. Review all roles before saving.`,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`This permission file is invalid or exceeds 5 MB.`,
      });
    } finally {
      setImporting(false);
    }
  };
  const handleExport = () => {
    if (!definitionToExport) return;
    saveAs(
      new Blob([JSON.stringify(definitionToExport, null, 2)], {
        type: 'application/json',
      }),
      'record-permissions.json',
    );
  };
  return (
    <>
      <StyledActions>
        <Button
          variant="outline"
          size="sm"
          disabled={!definition}
          onClick={handleExport}
        >{t`Export permissions`}</Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || importing}
          onClick={() => inputRef.current?.click()}
        >{t`Import permissions`}</Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImport}
        />
      </StyledActions>
      <StyledDescription>{t`Transfer object rules and related-record paths for all roles between workspaces with matching metadata. This file excludes record shares and field restrictions.`}</StyledDescription>
    </>
  );
};
