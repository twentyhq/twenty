import { Trans, useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { styled } from '@linaria/react';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconCheck, IconX } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { Button, Checkbox } from 'twenty-ui/input';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useEffect, useState } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledRestoreButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledLocalButton = styled(Button)`
  min-width: 70px;
`;

const StyledMainButton = styled(Button)`
  min-width: 110px;
`;

const StyledStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.color.green};

  &.error {
    color: ${themeCssVariables.color.red};
  }
`;

const StyledCheckboxLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsDatabaseBackup = () => {
  const { t } = useLingui();
  const [enabled, setEnabled] = useState(false);
  const [cron, setCron] = useState('0 0 * * *');
  const [bucket, setBucket] = useState('');
  const [region, setRegion] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isCronEditing, setIsCronEditing] = useState(false);
  const [isStorageEditing, setIsStorageEditing] = useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [backupOptions, setBackupOptions] = useState<{ label: string; value: string }[]>([]);

  const handleEditCron = () => {
    setIsCronEditing(true);
  };

  const handleEditStorage = () => {
    setIsStorageEditing(true);
  };

  const isStorageDisabled = !isStorageEditing;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/settings`);
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled);
          setCron(data.cronSchedule);
          setBucket(data.bucketName);
          setRegion(data.region);
          setEndpoint(data.endpoint);
          setAccessKey(data.accessKeyId);
          setSecretKey(data.secretAccessKey);
           setIsSaved(true);
           setIsCronEditing(false);
           setIsStorageEditing(false);
          
          // Test connection on load if settings exist
          if (data.bucketName && data.accessKeyId) {
            testConnection(true);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/list`);
      if (response.ok) {
        const data = await response.json();
        const options = data.map((name: string) => ({ label: name, value: name }));
        setBackupOptions(options);
        
        // Default to latest backup if none selected
        if (options.length > 0 && !restoreFileName) {
          setRestoreFileName(options[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const testConnection = async (isSilent = false) => {
    if (!isSilent) {
      setConnectionStatus('testing');
    }
    try {
      const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/test-connection`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('failed');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          cronSchedule: cron,
          bucketName: bucket,
          region,
          endpoint,
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        setIsCronEditing(false);
        setIsStorageEditing(false);
        await testConnection(true);
      } else {
        alert(t`Failed to save settings`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t`Error saving settings`);
    }
  };

  const handleBackupNow = async () => {
    setIsBackupInProgress(true);
    try {
      const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/trigger`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(t`Backup created successfully: ${data.fileName}`);
        await fetchBackups();
        setRestoreFileName(data.fileName);
      } else {
        alert(t`Failed to trigger backup`);
      }
    } catch (error) {
      console.error('Error triggering backup:', error);
      alert(t`Error triggering backup`);
    } finally {
      setIsBackupInProgress(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFileName) {
      alert(t`Please enter a file name to restore`);
      return;
    }

    if (!confirm(t`Are you sure you want to restore? This will overwrite existing data.`)) {
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/database-backup/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: restoreFileName }),
      });

      if (response.ok) {
        alert(t`Restore triggered successfully`);
      } else {
        alert(t`Failed to trigger restore`);
      }
    } catch (error) {
      console.error('Error triggering restore:', error);
      alert(t`Error triggering restore`);
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Database Backup`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Database Backup</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Backup Configuration`}
            description={t`Configure automatic database backups to AWS S3 or Cloudflare R2`}
          />
          <StyledCheckboxLabelContainer>
            <Checkbox
              checked={enabled}
               onCheckedChange={(e) => {
                setEnabled(e);
                if (e) {
                  setIsCronEditing(true);
                }
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              hoverable={false}
            />
             <Trans>Enable Automatic Backups</Trans>
          </StyledCheckboxLabelContainer>
          
          <SettingsTextInput
            instanceId="backup-cron-schedule"
            label={t`Cron Schedule`}
            value={cron}
            onChange={(e) => {
              setCron(e);
              setIsSaved(false);
              setConnectionStatus('idle');
            }}
            placeholder="0 0 * * *"
            disabled={!enabled || !isCronEditing}
          />

          <StyledButtonsWrapper>
            <StyledLocalButton
              onClick={(!enabled || isCronEditing) ? handleSave : handleEditCron}
              variant="secondary"
              title={(!enabled || isCronEditing) ? t`Save` : t`Edit`}
              disabled={!enabled}
            />
          </StyledButtonsWrapper>

          <div style={{ marginTop: themeCssVariables.spacing[6] }}>
            <H2Title
              title={t`Cloud Storage Settings`}
              description={t`Specify the S3 or R2 bucket details`}
            />
            <SettingsTextInput
              instanceId="backup-bucket-name"
              label={t`Bucket Name`}
              value={bucket}
              onChange={(e) => {
                setBucket(e);
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              disabled={isStorageDisabled}
            />
            <SettingsTextInput
              instanceId="backup-region"
              label={t`Region (auto or blank for R2)`}
              value={region}
              onChange={(e) => {
                setRegion(e);
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              disabled={isStorageDisabled}
            />
            <SettingsTextInput
              instanceId="backup-endpoint"
              label={t`Endpoint`}
              value={endpoint}
              onChange={(e) => {
                setEndpoint(e);
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              disabled={isStorageDisabled}
            />
            <SettingsTextInput
              instanceId="backup-access-key-id"
              label={t`Access Key ID`}
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e);
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              disabled={isStorageDisabled}
            />
            <SettingsTextInput
              instanceId="backup-secret-access-key"
              label={t`Secret Access Key`}
              value={secretKey}
              type="password"
              onChange={(e) => {
                setSecretKey(e);
                setIsSaved(false);
                setConnectionStatus('idle');
              }}
              disabled={isStorageDisabled}
            />
          </div>

          <StyledButtonsWrapper>
            <StyledMainButton 
                onClick={isStorageEditing ? handleSave : handleEditStorage}
                variant="secondary" 
                title={isStorageEditing ? t`Save Settings` : t`Edit Settings`} 
              />
              <StyledMainButton 
                  onClick={handleBackupNow} 
                  variant="secondary" 
                  title={isBackupInProgress ? t`Backing up...` : t`Backup Now`} 
                  disabled={isStorageEditing || isBackupInProgress}
              />
              {connectionStatus === 'testing' && (
                <StyledStatusContainer>{t`Testing connection...`}</StyledStatusContainer>
              )}
              {connectionStatus === 'success' && (
                <StyledStatusContainer>
                  <IconCheck size={16} />
                  {t`Connection successful`}
                </StyledStatusContainer>
              )}
              {connectionStatus === 'failed' && (
                <StyledStatusContainer className="error">
                  <IconX size={16} />
                  {t`Connection failed`}
                </StyledStatusContainer>
              )}
            </StyledButtonsWrapper>

          <div style={{ marginTop: themeCssVariables.spacing[8] }}>
            <H2Title
              title={t`Restore`}
              description={t`Restore the database from a previous backup. Warning: This will overwrite existing data.`}
            />
            <Select
              dropdownId="restore-backup-select"
              label={t`Select Backup File`}
              value={restoreFileName}
              options={backupOptions}
              onChange={(value) => setRestoreFileName(value)}
              emptyOption={{ label: t`No backups found`, value: '' }}
              dropdownWidthAuto
              fullWidth
            />
            <StyledRestoreButtonContainer>
              <StyledMainButton onClick={handleRestore} variant="secondary" accent="danger" title={t`Restore Database`} />
            </StyledRestoreButtonContainer>
          </div>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
