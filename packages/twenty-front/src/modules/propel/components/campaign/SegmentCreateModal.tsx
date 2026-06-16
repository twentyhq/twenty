import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconFileUpload,
  IconFilter,
  IconUpload,
} from 'twenty-ui/display';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  buildCriteriaV2,
  envelopeMessage,
  fileToBase64,
  LEAD_SOURCE_OPTIONS,
  MEDIA_MAX_DECODED_BYTES,
} from '@/propel/lib/campaignBuilderConfig';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  type ImportColMap,
  type ImportCommitResponse,
  type ImportPreviewResponse,
  type SaveSegmentResponse,
  type SegmentOption,
} from '@/propel/types/campaignBuilder';

const EMPTY_MAP: ImportColMap = {
  email: null,
  phone: null,
  firstName: null,
  lastName: null,
  fullName: null,
};

const ROLE_LABELS: { key: keyof ImportColMap; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'fullName', label: 'Full name' },
];

// Real Mantine Modal — focus-trapped, escape-closeable, scrolls independently.
// Two ways to make an audience: upload a CSV/Excel of contacts (two-phase:
// preview columns → confirm map → commit), or define live criteria (lead
// source(s) + a relative cold window). On success it hands a SegmentOption back
// so the just-made audience is selectable in the wizard immediately.
export const SegmentCreateModal = ({
  opened,
  onClose,
  onCreated,
  channel,
}: {
  opened: boolean;
  onClose: () => void;
  onCreated: (segment: SegmentOption) => void;
  channel: 'EMAIL' | 'WHATSAPP';
}) => {
  const notify = usePropelToast();
  const [mode, setMode] = useState<'csv' | 'criteria'>('csv');
  const [name, setName] = useState('');

  // CSV / Excel two-phase upload state.
  const [phase, setPhase] = useState<'pick' | 'map'>('pick');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [fileB64, setFileB64] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [preview, setPreview] = useState<{
    headers: string[];
    sampleRows: string[][];
    totalRows: number;
  } | null>(null);
  const [colMap, setColMap] = useState<ImportColMap>(EMPTY_MAP);
  const [committing, setCommitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inFlightRef = useRef(false);

  // Criteria state.
  const [sources, setSources] = useState<string[]>([]);
  const [coldDays, setColdDays] = useState('');
  const [savingCriteria, setSavingCriteria] = useState(false);
  const [criteriaErr, setCriteriaErr] = useState('');

  const resetAll = useCallback(() => {
    setMode('csv');
    setName('');
    setPhase('pick');
    setUploadErr('');
    setFileB64('');
    setFileName('');
    setFileType('');
    setPreview(null);
    setColMap(EMPTY_MAP);
    setSources([]);
    setColdDays('');
    setCriteriaErr('');
  }, []);

  const handleClose = useCallback(() => {
    if (uploading || committing || savingCriteria) return;
    resetAll();
    onClose();
  }, [uploading, committing, savingCriteria, resetAll, onClose]);

  // Phase 1 — read the chosen File's bytes and ask the server to PREVIEW columns
  // (creates nothing). Native File.arrayBuffer() replaces the sandbox's
  // readFrontComponentFile RPC.
  const onPickFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file || inFlightRef.current) return;
      if (!name.trim()) {
        setUploadErr('Name the segment first, then choose a file.');
        return;
      }
      if (file.size > MEDIA_MAX_DECODED_BYTES) {
        const maxMb = Math.floor(MEDIA_MAX_DECODED_BYTES / (1024 * 1024));
        setUploadErr(`That file is too large (max ${maxMb} MB). Split the list and try again.`);
        return;
      }
      inFlightRef.current = true;
      setUploading(true);
      setUploadErr('');
      try {
        const contentBase64 = await fileToBase64(file);
        const res = await callPropelRoute<ImportPreviewResponse>(
          '/marketing/import-segment',
          {
            name: name.trim(),
            filename: file.name,
            contentType: file.type,
            contentBase64,
            mode: 'preview',
          },
        );
        if (res && res.ok && res.headers) {
          setFileB64(contentBase64);
          setFileName(file.name);
          setFileType(file.type);
          setPreview({
            headers: res.headers,
            sampleRows: res.sampleRows ?? [],
            totalRows: res.totalRows ?? 0,
          });
          setColMap(res.detected ?? EMPTY_MAP);
          setPhase('map');
        } else {
          setUploadErr(
            envelopeMessage(
              res,
              'Could not read that file — check the format and try again.',
            ),
          );
        }
      } catch {
        setUploadErr('Upload failed — check your connection and try again.');
      } finally {
        inFlightRef.current = false;
        setUploading(false);
      }
    },
    [name],
  );

  // Phase 2 — commit with the confirmed column map (re-sends the cached bytes).
  const commitImport = useCallback(async () => {
    if (committing) return;
    if (colMap.email === null && colMap.phone === null) {
      setUploadErr('Map a column to Email and/or Phone so we know who to contact.');
      return;
    }
    setCommitting(true);
    setUploadErr('');
    try {
      const res = await callPropelRoute<ImportCommitResponse>(
        '/marketing/import-segment',
        {
          name: name.trim(),
          filename: fileName,
          contentType: fileType,
          contentBase64: fileB64,
          mode: 'commit',
          columnMap: colMap,
        },
      );
      if (res && res.ok && res.segmentId) {
        const listSize = res.listSize ?? 0;
        onCreated({
          id: res.segmentId,
          name: res.name ?? name.trim(),
          lastResolvedCount: listSize,
          lastResolvedLabel: `~${listSize.toLocaleString('en-US')} (just now)`,
        });
        notify(
          `Segment ready — ${res.matched ?? 0} matched, ${res.created ?? 0} new contact${
            (res.created ?? 0) === 1 ? '' : 's'
          }${res.capped ? ' (list truncated to the cap)' : ''}.`,
          'success',
        );
        resetAll();
        onClose();
      } else {
        setUploadErr(
          envelopeMessage(res, 'Import failed — check the mapping and try again.'),
        );
      }
    } catch {
      setUploadErr('Import failed — check your connection and try again.');
    } finally {
      setCommitting(false);
    }
  }, [
    committing,
    colMap,
    name,
    fileName,
    fileType,
    fileB64,
    onCreated,
    notify,
    resetAll,
    onClose,
  ]);

  // Criteria save (+ honest resolve so the picker label is truthful).
  const saveCriteria = useCallback(async () => {
    if (savingCriteria) return;
    if (!name.trim()) {
      setCriteriaErr('Name the segment first.');
      return;
    }
    if (sources.length === 0 && !coldDays.trim()) {
      setCriteriaErr('Add at least one filter — a lead source and/or a cold window.');
      return;
    }
    setSavingCriteria(true);
    setCriteriaErr('');
    try {
      const res = await callPropelRoute<SaveSegmentResponse>(
        '/marketing/save-segment',
        {
          name: name.trim(),
          criteria: buildCriteriaV2({ sources, coldDays }),
          channel,
          resolve: true,
        },
      );
      if (res && res.ok && res.segmentId) {
        const estimate = res.estimate ?? 0;
        onCreated({
          id: res.segmentId,
          name: name.trim(),
          lastResolvedCount: estimate,
          lastResolvedLabel: `~${estimate.toLocaleString('en-US')} (just now)`,
        });
        notify(`Segment created — ~${estimate.toLocaleString('en-US')} contacts.`, 'success');
        resetAll();
        onClose();
      } else {
        setCriteriaErr(
          envelopeMessage(res, 'Could not save the segment — check the filters.'),
        );
      }
    } catch {
      setCriteriaErr('Could not save the segment — check your connection.');
    } finally {
      setSavingCriteria(false);
    }
  }, [
    savingCriteria,
    name,
    sources,
    coldDays,
    channel,
    onCreated,
    notify,
    resetAll,
    onClose,
  ]);

  const setRole = (role: keyof ImportColMap, value: string | null) =>
    setColMap((c) => ({
      ...c,
      [role]: value === null || value === '' ? null : Number.parseInt(value, 10),
    }));

  const columnOptions = (preview?.headers ?? []).map((h, idx) => ({
    value: String(idx),
    label: h || `Column ${idx + 1}`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New segment"
      size="lg"
      centered
      closeOnClickOutside={!uploading && !committing && !savingCriteria}
    >
      <Stack gap="md">
        <TextInput
          label="Segment name"
          placeholder="e.g. Cold Marina leads"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <SegmentedControl
          fullWidth
          value={mode}
          onChange={(v) => {
            setMode(v as 'csv' | 'criteria');
            setUploadErr('');
            setCriteriaErr('');
          }}
          data={[
            { label: 'Upload a list', value: 'csv' },
            { label: 'Build with criteria', value: 'criteria' },
          ]}
        />

        {mode === 'csv' ? (
          phase === 'pick' ? (
            <Stack gap="sm">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: 'none' }}
                onChange={(e) => {
                  void onPickFile(e.currentTarget.files?.[0]);
                  e.currentTarget.value = '';
                }}
              />
              <Box
                onClick={() => {
                  if (!name.trim()) {
                    setUploadErr('Name the segment first, then choose a file.');
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void onPickFile(e.dataTransfer.files?.[0]);
                }}
                style={{
                  border: '1.5px dashed var(--mantine-color-default-border)',
                  borderRadius: 'var(--mantine-radius-md)',
                  padding: '32px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--mantine-color-body)',
                }}
              >
                <IconUpload
                  size={28}
                  style={{ color: 'var(--mantine-color-dimmed)' }}
                />
                <Text size="sm" fw={600} mt={8} c="var(--mantine-color-text)">
                  {uploading ? 'Reading file…' : 'Click or drop a CSV / Excel file'}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  We match contacts to people you already have, then create the
                  rest. Email and/or Phone columns required.
                </Text>
              </Box>
              {uploadErr !== '' && (
                <Alert
                  color="red"
                  variant="light"
                  icon={<IconAlertCircle size={16} />}
                >
                  {uploadErr}
                </Alert>
              )}
            </Stack>
          ) : (
            preview && (
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  {preview.totalRows.toLocaleString('en-US')} rows. Confirm which
                  column is which:
                </Text>
                <Group gap="sm" grow>
                  {ROLE_LABELS.map(({ key, label }) => (
                    <Select
                      key={key}
                      label={label}
                      placeholder="—"
                      clearable
                      value={colMap[key] === null ? null : String(colMap[key])}
                      onChange={(v) => setRole(key, v)}
                      data={columnOptions}
                    />
                  ))}
                </Group>
                {preview.sampleRows.length > 0 && (
                  <Box
                    style={{
                      overflowX: 'auto',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 'var(--mantine-radius-sm)',
                    }}
                  >
                    <Table striped withColumnBorders fz="xs">
                      <Table.Thead>
                        <Table.Tr>
                          {preview.headers.map((h, idx) => (
                            <Table.Th key={idx}>{h || `Col ${idx + 1}`}</Table.Th>
                          ))}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {preview.sampleRows.map((row, rIdx) => (
                          <Table.Tr key={rIdx}>
                            {preview.headers.map((_h, cIdx) => (
                              <Table.Td key={cIdx}>{row[cIdx] ?? ''}</Table.Td>
                            ))}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                )}
                {uploadErr !== '' && (
                  <Alert
                    color="red"
                    variant="light"
                    icon={<IconAlertCircle size={16} />}
                  >
                    {uploadErr}
                  </Alert>
                )}
                <Group justify="space-between">
                  <Button
                    variant="default"
                    onClick={() => {
                      setPhase('pick');
                      setPreview(null);
                      setFileB64('');
                      setUploadErr('');
                    }}
                  >
                    Choose a different file
                  </Button>
                  <Button
                    color="red"
                    leftSection={<IconFileUpload size={16} />}
                    loading={committing}
                    onClick={() => void commitImport()}
                  >
                    Import {preview.totalRows.toLocaleString('en-US')} rows
                  </Button>
                </Group>
              </Stack>
            )
          )
        ) : (
          <Stack gap="sm">
            <MultiSelect
              label="Lead source"
              placeholder="Any source"
              data={LEAD_SOURCE_OPTIONS}
              value={sources}
              onChange={setSources}
              clearable
            />
            <TextInput
              label="Cold for at least (days)"
              description="No marketing touch in the last N days. Leave blank for no cold filter."
              placeholder="e.g. 90"
              type="number"
              value={coldDays}
              onChange={(e) => setColdDays(e.currentTarget.value)}
            />
            <Text size="xs" c="dimmed">
              Segments resolve live at send time — editing the filters changes the
              audience of every draft pointing at this segment.
            </Text>
            {criteriaErr !== '' && (
              <Alert
                color="red"
                variant="light"
                icon={<IconAlertCircle size={16} />}
              >
                {criteriaErr}
              </Alert>
            )}
            <Group justify="flex-end">
              <Button
                color="red"
                leftSection={<IconFilter size={16} />}
                loading={savingCriteria}
                onClick={() => void saveCriteria()}
              >
                Create &amp; estimate
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
