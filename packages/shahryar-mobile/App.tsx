import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  type ShahryarMobileAssignedMarket,
  type ShahryarMobileRecordDraft,
  type ShahryarMobileRecordKind,
  type ShahryarMobileSyncQueueItem,
} from 'twenty-shared/shahryar';

import {
  pullShahryarMobileSyncData,
  registerShahryarMobileNotifications,
  signInShahryarMobile,
  syncOfflineVisitQueue,
} from './src/api/shahryarMobileApi';
import {
  getShahryarExpoPushToken,
  getShahryarNotificationPlatform,
  getCurrentGpsLocation,
  requestShahryarDevicePermissions,
} from './src/services/deviceCapabilities';
import {
  applyOfflineVisitSyncResponse,
  discardOfflineSyncQueueItem,
  loadOfflineSyncQueue,
  retryOfflineSyncQueueItem,
  saveOfflineRecordDraft,
} from './src/storage/offlineVisitStore';
import { VisitPhotoCapture } from './src/components/VisitPhotoCapture';
import { type ShahryarMobileVisitDraft } from './src/sync/mobileSyncQueue';
import { getOrCreateShahryarMobileDeviceId } from './src/services/deviceIdentity';
import { shahryarColors } from './src/theme';

const fallbackAssignedMarkets: ShahryarMobileAssignedMarket[] = [
  {
    id: '20202020-0101-4000-8000-000000000001',
    name: 'مارکێتی ئارام',
    ownerName: 'ئارام عەلی',
    phone: '0750 000 0001',
    address: 'هەولێر',
    district: 'هەولێر',
    gpsLocation: {
      latitude: 36.191,
      longitude: 44.009,
    },
    debtStatus: 'paid',
  },
  {
    id: '20202020-0101-4000-8000-000000000002',
    name: 'وەکیلی زاگرۆس',
    ownerName: 'سۆران قادر',
    phone: '0750 000 0002',
    address: 'هەولێر',
    district: 'هەولێر',
    gpsLocation: {
      latitude: 36.205,
      longitude: 44.023,
    },
    debtStatus: 'open',
  },
];

const fallbackSupervisorId = '20202020-0687-4c41-b707-ed1bfca972a7';
const defaultApiBaseUrl = 'http://localhost:3000';

const marketDebtStatusLabels: Record<
  ShahryarMobileAssignedMarket['debtStatus'],
  string
> = {
  open: 'قەرز ماوە',
  paid: 'پارەدان کراوە',
  partial: 'بەشێک دراوە',
};

const recordKindLabels: Record<ShahryarMobileRecordKind, string> = {
  absence: 'غیاب',
  payment: 'پارەدان',
  visit: 'سەردان',
  'working-time': 'کاتی کار',
};

const formatMarketGps = (market: ShahryarMobileAssignedMarket): string =>
  `${market.gpsLocation.latitude.toFixed(3)}, ${market.gpsLocation.longitude.toFixed(3)}`;

const isQueueItemNeedingAttention = (
  item: ShahryarMobileSyncQueueItem,
): boolean =>
  item.status === 'pending' ||
  item.status === 'conflict' ||
  item.status === 'rejected';

const countQueueItemsNeedingAttention = (
  queue: ShahryarMobileSyncQueueItem[],
): number => {
  return queue.filter(isQueueItemNeedingAttention).length;
};

export default function App() {
  const [username, setUsername] = useState('karwan');
  const [password, setPassword] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState(defaultApiBaseUrl);
  const [accessToken, setAccessToken] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [assignedMarkets, setAssignedMarkets] = useState<
    ShahryarMobileAssignedMarket[]
  >(fallbackAssignedMarkets);
  const [selectedMarket, setSelectedMarket] = useState<
    ShahryarMobileAssignedMarket | undefined
  >(fallbackAssignedMarkets[0]);
  const [currentSupervisorId, setCurrentSupervisorId] =
    useState(fallbackSupervisorId);
  const [marketSearchTerm, setMarketSearchTerm] = useState('');
  const [soldCartons, setSoldCartons] = useState('0');
  const [requestedCartons, setRequestedCartons] = useState('0');
  const [report, setReport] = useState('');
  const [photoLocalUris, setPhotoLocalUris] = useState<string[]>([]);
  const [workingTimeMinutes, setWorkingTimeMinutes] = useState('480');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [absenceReason, setAbsenceReason] = useState<
    'ABSENT' | 'LATE' | 'NO_WORK'
  >('ABSENT');
  const [absenceNotes, setAbsenceNotes] = useState('');
  const [offlineQueueItems, setOfflineQueueItems] = useState<
    ShahryarMobileSyncQueueItem[]
  >([]);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncStatusMessage, setSyncStatusMessage] = useState(
    'ئامادەیە بۆ کارکردنی ئۆفلاین.',
  );

  const refreshOfflineQueue = async () => {
    const queue = await loadOfflineSyncQueue();

    setOfflineQueueItems(queue);
    setOfflineQueueCount(countQueueItemsNeedingAttention(queue));
  };

  useEffect(() => {
    void getOrCreateShahryarMobileDeviceId().then(setDeviceId);
    void refreshOfflineQueue();
  }, []);

  const canSaveVisit = useMemo(
    () =>
      report.trim().length > 0 &&
      selectedMarket !== undefined &&
      photoLocalUris.length > 0,
    [photoLocalUris.length, report, selectedMarket],
  );
  const isAuthenticated = accessToken.trim().length > 0;
  const filteredAssignedMarkets = useMemo(() => {
    const normalizedSearch = marketSearchTerm.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return assignedMarkets;
    }

    return assignedMarkets.filter((market) =>
      [
        market.name,
        market.ownerName,
        market.phone,
        market.address,
        market.district,
        marketDebtStatusLabels[market.debtStatus],
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [assignedMarkets, marketSearchTerm]);

  const refreshAssignedMarkets = async (token: string) => {
    const pullResponse = await pullShahryarMobileSyncData({
      accessToken: token,
      apiBaseUrl: apiBaseUrl.trim(),
    });

    if (pullResponse.assignedMarkets.length > 0) {
      setAssignedMarkets(pullResponse.assignedMarkets);
      setSelectedMarket(pullResponse.assignedMarkets[0]);
    }

    if (pullResponse.currentSupervisorId !== undefined) {
      setCurrentSupervisorId(pullResponse.currentSupervisorId);
    }

    setSyncStatusMessage(
      `${pullResponse.assignedMarkets.length} مارکێت لە سێرڤەرەوە وەرگیرا.`,
    );
  };

  const registerNotifications = async ({
    token,
    targetDeviceId,
  }: {
    token: string;
    targetDeviceId: string;
  }) => {
    const platform = getShahryarNotificationPlatform();

    if (platform === undefined) {
      return;
    }

    const expoPushToken = await getShahryarExpoPushToken();

    if (expoPushToken === undefined) {
      return;
    }

    await registerShahryarMobileNotifications({
      accessToken: token,
      apiBaseUrl: apiBaseUrl.trim(),
      request: {
        deviceId: targetDeviceId,
        expoPushToken,
        platform,
      },
    });
  };

  const handleSignIn = async () => {
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0 || trimmedPassword.length === 0) {
      Alert.alert('زانیاری پێویستە', 'ناوی بەکارهێنەر و وشەی نهێنی بنووسە.');

      return;
    }

    let token: string;

    try {
      token = await signInShahryarMobile({
        apiBaseUrl: apiBaseUrl.trim(),
        username: trimmedUsername,
        password: trimmedPassword,
      });
    } catch {
      setAccessToken('');
      setSyncStatusMessage('چوونەژوورەوە سەرکەوتوو نەبوو.');

      return;
    }

    setAccessToken(token);

    try {
      const currentDeviceId =
        deviceId.trim().length > 0
          ? deviceId
          : await getOrCreateShahryarMobileDeviceId();

      setDeviceId(currentDeviceId);

      const permissions = await requestShahryarDevicePermissions();

      if (permissions.notificationsGranted) {
        await registerNotifications({
          token,
          targetDeviceId: currentDeviceId,
        }).catch(() => undefined);
      }

      await refreshAssignedMarkets(token);
    } catch {
      setSyncStatusMessage(
        'نەتوانرا لە سێرڤەرەوە مارکێتەکان وەربگیرێت؛ داتای ناوخۆ بەکاردەهێنرێت.',
      );
    }
  };

  const handleSaveVisit = async () => {
    if (!canSaveVisit) {
      Alert.alert('ڕاپۆرت پێویستە', 'تکایە ڕاپۆرتی سەردان بنووسە.');

      return;
    }

    if (selectedMarket === undefined) {
      Alert.alert('مارکێت نییە', 'تکایە مارکێتێک هەڵبژێرە.');

      return;
    }

    const now = new Date().toISOString();
    const gpsLocation = await getCurrentGpsLocation();
    const draft: ShahryarMobileVisitDraft = {
      localId: `visit-${now}`,
      assignedMarketId: selectedMarket.id,
      supervisorId: currentSupervisorId,
      checkInAt: now,
      gpsLocation,
      photoLocalUris,
      photoFileIds: [],
      soldCartons: Number(soldCartons),
      requestedCartons: Number(requestedCartons),
      issue: '',
      decisionMaker: 'ئەدمین',
      requestDetails: '',
      report,
      updatedAt: now,
    };

    await saveOfflineRecordDraft({ draft, now });
    await refreshOfflineQueue();
    setSyncStatusMessage('سەردانەکە لە ڕیزی ئۆفلاینە.');
    setReport('');
    setPhotoLocalUris([]);
    Alert.alert('پاشەکەوت کرا', 'سەردانەکە لە ڕیزی ئۆفلاین پاشەکەوت کرا.');
  };

  const handleSaveOfflineRecord = async ({
    draft,
    successMessage,
  }: {
    draft: ShahryarMobileRecordDraft;
    successMessage: string;
  }) => {
    await saveOfflineRecordDraft({
      draft,
      now: draft.updatedAt,
    });
    await refreshOfflineQueue();
    setSyncStatusMessage(successMessage);
  };

  const handleSaveWorkingTime = async () => {
    const now = new Date().toISOString();
    const gpsLocation = await getCurrentGpsLocation();

    await handleSaveOfflineRecord({
      draft: {
        recordKind: 'working-time',
        localId: `working-time-${now}`,
        supervisorId: currentSupervisorId,
        workDate: now.slice(0, 10),
        checkInAt: now,
        checkOutAt: now,
        gpsLocation,
        totalMinutes: Number(workingTimeMinutes),
        status: 'PRESENT',
        updatedAt: now,
      },
      successMessage: 'کاتی کار لە ڕیزی ئۆفلاین پاشەکەوت کرا.',
    });
  };

  const handleSavePayment = async () => {
    if (selectedMarket === undefined) {
      Alert.alert('مارکێت نییە', 'پێش پارەدان مارکێتێک هەڵبژێرە.');

      return;
    }

    const now = new Date().toISOString();

    await handleSaveOfflineRecord({
      draft: {
        recordKind: 'payment',
        localId: `payment-${now}`,
        marketId: selectedMarket.id,
        collectedById: currentSupervisorId,
        amount: Number(paymentAmount),
        paidAt: now.slice(0, 10),
        status: 'PARTIAL',
        notes: paymentNotes,
        updatedAt: now,
      },
      successMessage: 'پارەدان لە ڕیزی ئۆفلاین پاشەکەوت کرا.',
    });
    setPaymentNotes('');
  };

  const handleSaveAbsence = async () => {
    const now = new Date().toISOString();
    const gpsLocation = await getCurrentGpsLocation();

    await handleSaveOfflineRecord({
      draft: {
        recordKind: 'absence',
        localId: `absence-${now}`,
        supervisorId: currentSupervisorId,
        absenceDate: now.slice(0, 10),
        workingTime: `${workingTimeMinutes} خولەک`,
        gpsLocation,
        reason: absenceReason,
        notes: absenceNotes,
        updatedAt: now,
      },
      successMessage: 'غیاب لە ڕیزی ئۆفلاین پاشەکەوت کرا.',
    });
    setAbsenceNotes('');
  };

  const handleSyncQueue = async () => {
    if (!isAuthenticated) {
      Alert.alert('چوونەژوورەوە پێویستە', 'پێش Sync چوونەژوورەوە بکە.');

      return;
    }

    const queue = await loadOfflineSyncQueue();

    if (queue.filter(isQueueItemNeedingAttention).length === 0) {
      setSyncStatusMessage('هیچ تۆمارێکی ئۆفلاین بۆ Sync نییە.');

      return;
    }

    const currentDeviceId =
      deviceId.trim().length > 0
        ? deviceId
        : await getOrCreateShahryarMobileDeviceId();

    setDeviceId(currentDeviceId);

    try {
      const response = await syncOfflineVisitQueue({
        accessToken,
        apiBaseUrl: apiBaseUrl.trim(),
        deviceId: currentDeviceId,
        queue,
      });
      const reconciliation = await applyOfflineVisitSyncResponse({ response });

      setOfflineQueueItems(reconciliation.queue);
      setOfflineQueueCount(
        countQueueItemsNeedingAttention(reconciliation.queue),
      );
      setSyncStatusMessage(
        `${reconciliation.acceptedLocalIds.length} قبوڵ کرا، ${reconciliation.conflictedLocalIds.length} conflict، ${reconciliation.rejectedLocalIds.length} ڕەتکرایەوە.`,
      );
    } catch {
      setSyncStatusMessage(
        'Sync سەرکەوتوو نەبوو؛ ڕیزی ئۆفلاین لە مۆبایلەکە دەمێنێتەوە.',
      );
    }
  };

  const handleRetryQueueItem = async (localId: string) => {
    const queue = await retryOfflineSyncQueueItem({
      localId,
      now: new Date().toISOString(),
    });

    setOfflineQueueItems(queue);
    setOfflineQueueCount(countQueueItemsNeedingAttention(queue));
    setSyncStatusMessage('تۆمارەکە گەڕایەوە بۆ ڕیزی Sync.');
  };

  const handleDiscardQueueItem = async (localId: string) => {
    const queue = await discardOfflineSyncQueueItem({
      localId,
      now: new Date().toISOString(),
    });

    setOfflineQueueItems(queue);
    setOfflineQueueCount(countQueueItemsNeedingAttention(queue));
    setSyncStatusMessage('تۆمارەکە لە ڕیزی Sync لابرا.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shahryar OPS</Text>
          <Text style={styles.subtitle}>مۆبایل ئەپی موشریف</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>چوونەژوورەوە</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="ناوی بەکارهێنەر"
            style={styles.input}
            value={username}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setApiBaseUrl}
            placeholder="API URL"
            style={styles.input}
            value={apiBaseUrl}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="وشەی نهێنی"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Pressable onPress={handleSignIn} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>چوونەژوورەوە</Text>
          </Pressable>
          <Text style={styles.statusText}>
            {isAuthenticated
              ? `${username} ئامادەی Sync ـە.`
              : 'دەتوانیت ئۆفلاین کار بکەیت تا کاتی چوونەژوورەوە.'}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>مارکێتەکانی ئەمڕۆ</Text>
          <TextInput
            autoCorrect={false}
            onChangeText={setMarketSearchTerm}
            placeholder="گەڕان بە ناو، خاوەن، تەلەفۆن، ناونیشان"
            style={styles.input}
            value={marketSearchTerm}
          />
          {filteredAssignedMarkets.map((market) => (
            <Pressable
              key={market.id}
              onPress={() => setSelectedMarket(market)}
              style={[
                styles.marketRow,
                selectedMarket?.id === market.id && styles.marketRowSelected,
              ]}
            >
              <Text style={styles.marketName}>{market.name}</Text>
              <Text style={styles.marketMeta}>
                {market.ownerName} | {market.phone} | {market.district}
              </Text>
              <Text style={styles.marketMeta}>
                {market.address} | {marketDebtStatusLabels[market.debtStatus]}
              </Text>
              <Text style={styles.marketMeta}>
                GPS {formatMarketGps(market)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Check-in و ڕاپۆرت</Text>
          <View style={styles.inlineInputs}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setSoldCartons}
              placeholder="فرۆشتن"
              style={[styles.input, styles.inlineInput]}
              value={soldCartons}
            />
            <TextInput
              keyboardType="number-pad"
              onChangeText={setRequestedCartons}
              placeholder="داواکاری"
              style={[styles.input, styles.inlineInput]}
              value={requestedCartons}
            />
          </View>
          <TextInput
            multiline
            onChangeText={setReport}
            placeholder="ڕاپۆرتی سەردان"
            style={[styles.input, styles.reportInput]}
            value={report}
          />
          <VisitPhotoCapture
            onPhotoCaptured={(uri) =>
              setPhotoLocalUris((currentPhotoUris) => [
                ...currentPhotoUris,
                uri,
              ])
            }
            onPhotoRemoved={(uri) =>
              setPhotoLocalUris((currentPhotoUris) =>
                currentPhotoUris.filter((photoUri) => photoUri !== uri),
              )
            }
            photoUris={photoLocalUris}
          />
          <Text style={styles.statusText}>
            {photoLocalUris.length > 0
              ? `${photoLocalUris.length} وێنەی سەردان پاشەکەوت بوو.`
              : 'پێش پاشەکەوت، لانیکەم یەک وێنەی سەردان بگرە.'}
          </Text>
          <Pressable
            disabled={!canSaveVisit}
            onPress={handleSaveVisit}
            style={[
              styles.primaryButton,
              !canSaveVisit && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>پاشەکەوتی ئۆفلاین</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>تۆمارەکانی دیکە</Text>
          <View style={styles.inlineInputs}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setWorkingTimeMinutes}
              placeholder="خولەکی کار"
              style={[styles.input, styles.inlineInput]}
              value={workingTimeMinutes}
            />
            <Pressable
              onPress={() => void handleSaveWorkingTime()}
              style={[styles.secondaryButton, styles.inlineButton]}
            >
              <Text style={styles.secondaryButtonText}>کاتی کار</Text>
            </Pressable>
          </View>
          <View style={styles.inlineInputs}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setPaymentAmount}
              placeholder="بڕی پارەدان"
              style={[styles.input, styles.inlineInput]}
              value={paymentAmount}
            />
            <Pressable
              onPress={() => void handleSavePayment()}
              style={[styles.secondaryButton, styles.inlineButton]}
            >
              <Text style={styles.secondaryButtonText}>پارەدان</Text>
            </Pressable>
          </View>
          <TextInput
            onChangeText={setPaymentNotes}
            placeholder="تێبینی پارەدان"
            style={styles.input}
            value={paymentNotes}
          />
          <View style={styles.segmentedRow}>
            {(['ABSENT', 'LATE', 'NO_WORK'] as const).map((reason) => (
              <Pressable
                key={reason}
                onPress={() => setAbsenceReason(reason)}
                style={[
                  styles.segmentedButton,
                  absenceReason === reason && styles.segmentedButtonSelected,
                ]}
              >
                <Text style={styles.segmentedButtonText}>{reason}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            onChangeText={setAbsenceNotes}
            placeholder="تێبینی غیاب"
            style={styles.input}
            value={absenceNotes}
          />
          <Pressable
            onPress={() => void handleSaveAbsence()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>پاشەکەوتی غیاب</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSyncQueue} style={styles.syncPanel}>
          <Text style={styles.syncValue}>{offlineQueueCount}</Text>
          <Text style={styles.syncLabel}>ڕیزی Sync</Text>
        </Pressable>
        {offlineQueueItems.filter(isQueueItemNeedingAttention).map((item) => (
          <View key={item.localId} style={styles.queueRow}>
            <View style={styles.queueText}>
              <Text style={styles.queueTitle}>
                {recordKindLabels[item.recordKind]} | {item.status}
              </Text>
              <Text style={styles.queueMeta}>{item.localId}</Text>
              {item.conflict !== undefined ? (
                <Text style={styles.queueMeta}>
                  server-newer {item.conflict.serverUpdatedAt}
                </Text>
              ) : item.rejection !== undefined ? (
                <Text style={styles.queueMeta}>{item.rejection.reason}</Text>
              ) : null}
            </View>
            {(item.status === 'conflict' || item.status === 'rejected') && (
              <View style={styles.queueActions}>
                <Pressable
                  onPress={() => void handleRetryQueueItem(item.localId)}
                  style={styles.queueActionButton}
                >
                  <Text style={styles.queueActionText}>Retry</Text>
                </Pressable>
                <Pressable
                  onPress={() => void handleDiscardQueueItem(item.localId)}
                  style={styles.queueActionButton}
                >
                  <Text style={styles.queueActionText}>Discard</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
        <Text style={styles.statusText}>{syncStatusMessage}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: shahryarColors.surface,
    flex: 1,
  },
  container: {
    gap: 16,
    padding: 16,
  },
  header: {
    backgroundColor: shahryarColors.navy,
    borderRadius: 8,
    padding: 20,
  },
  title: {
    color: shahryarColors.white,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: shahryarColors.white,
    fontSize: 16,
    marginTop: 6,
  },
  panel: {
    backgroundColor: shahryarColors.white,
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: shahryarColors.navy,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  input: {
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: shahryarColors.navy,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: shahryarColors.blue,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: 'center',
  },
  statusText: {
    color: shahryarColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: shahryarColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: shahryarColors.navy,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: shahryarColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  inlineButton: {
    minWidth: 112,
  },
  marketRow: {
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  marketRowSelected: {
    borderColor: shahryarColors.blue,
    borderWidth: 2,
  },
  marketName: {
    color: shahryarColors.navy,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  marketMeta: {
    color: shahryarColors.textMuted,
    fontSize: 13,
    textAlign: 'right',
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineInput: {
    flex: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedButton: {
    alignItems: 'center',
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  segmentedButtonSelected: {
    borderColor: shahryarColors.blue,
    borderWidth: 2,
  },
  segmentedButtonText: {
    color: shahryarColors.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  reportInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  syncPanel: {
    alignItems: 'center',
    backgroundColor: shahryarColors.red,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 16,
  },
  syncValue: {
    color: shahryarColors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  syncLabel: {
    color: shahryarColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  queueRow: {
    alignItems: 'center',
    backgroundColor: shahryarColors.white,
    borderColor: shahryarColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    padding: 12,
  },
  queueText: {
    flex: 1,
    gap: 4,
  },
  queueTitle: {
    color: shahryarColors.navy,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  queueMeta: {
    color: shahryarColors.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
  queueActions: {
    gap: 6,
  },
  queueActionButton: {
    alignItems: 'center',
    borderColor: shahryarColors.blue,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  queueActionText: {
    color: shahryarColors.blue,
    fontSize: 12,
    fontWeight: '700',
  },
});
