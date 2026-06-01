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
import { type ShahryarMobileAssignedMarket } from 'twenty-shared/shahryar';

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
  loadOfflineVisitQueue,
  saveOfflineVisitDraft,
} from './src/storage/offlineVisitStore';
import { VisitPhotoCapture } from './src/components/VisitPhotoCapture';
import { type ShahryarMobileVisitDraft } from './src/sync/mobileSyncQueue';
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
const deviceId = 'shahryar-mobile-dev';
const defaultApiBaseUrl = 'http://localhost:3000';

const formatMarketGps = (market: ShahryarMobileAssignedMarket): string =>
  `${market.gpsLocation.latitude.toFixed(3)}, ${market.gpsLocation.longitude.toFixed(3)}`;

const countQueueItemsNeedingAttention = async (): Promise<number> => {
  const queue = await loadOfflineVisitQueue();

  return queue.filter((item) => item.status !== 'synced').length;
};

export default function App() {
  const [username, setUsername] = useState('karwan');
  const [password, setPassword] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState(defaultApiBaseUrl);
  const [accessToken, setAccessToken] = useState('');
  const [assignedMarkets, setAssignedMarkets] = useState<
    ShahryarMobileAssignedMarket[]
  >(fallbackAssignedMarkets);
  const [selectedMarket, setSelectedMarket] = useState<
    ShahryarMobileAssignedMarket | undefined
  >(fallbackAssignedMarkets[0]);
  const [currentSupervisorId, setCurrentSupervisorId] =
    useState(fallbackSupervisorId);
  const [soldCartons, setSoldCartons] = useState('0');
  const [requestedCartons, setRequestedCartons] = useState('0');
  const [report, setReport] = useState('');
  const [photoLocalUris, setPhotoLocalUris] = useState<string[]>([]);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncStatusMessage, setSyncStatusMessage] = useState(
    'ئامادەیە بۆ کارکردنی ئۆفلاین.',
  );

  useEffect(() => {
    void countQueueItemsNeedingAttention().then(setOfflineQueueCount);
  }, []);

  const canSaveVisit = useMemo(
    () =>
      report.trim().length > 0 &&
      selectedMarket !== undefined &&
      photoLocalUris.length > 0,
    [photoLocalUris.length, report, selectedMarket],
  );
  const isAuthenticated = accessToken.trim().length > 0;

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

  const registerNotifications = async (token: string) => {
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
        deviceId,
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
      const permissions = await requestShahryarDevicePermissions();

      if (permissions.notificationsGranted) {
        await registerNotifications(token).catch(() => undefined);
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
      decisionMaker: 'تەدمین',
      requestDetails: '',
      report,
      updatedAt: now,
    };

    await saveOfflineVisitDraft({ draft, now });
    setOfflineQueueCount(await countQueueItemsNeedingAttention());
    setSyncStatusMessage('سەردانەکە لە ڕیزی ئۆفلاینە.');
    setReport('');
    setPhotoLocalUris([]);
    Alert.alert('پاشەکەوت کرا', 'سەردانەکە لە ڕیزی ئۆفلاین پاشەکەوت کرا.');
  };

  const handleSyncQueue = async () => {
    if (!isAuthenticated) {
      Alert.alert('چوونەژوورەوە پێویستە', 'پێش Sync چوونەژوورەوە بکە.');

      return;
    }

    const queue = await loadOfflineVisitQueue();

    if (queue.length === 0) {
      setSyncStatusMessage('هیچ سەردانێکی ئۆفلاین بۆ Sync نییە.');

      return;
    }

    try {
      const response = await syncOfflineVisitQueue({
        accessToken,
        apiBaseUrl: apiBaseUrl.trim(),
        deviceId,
        queue,
      });
      const reconciliation = await applyOfflineVisitSyncResponse({ response });

      setOfflineQueueCount(
        reconciliation.queue.filter((item) => item.status !== 'synced').length,
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
          {assignedMarkets.map((market) => (
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
                {market.ownerName} | {market.district} |{' '}
                {formatMarketGps(market)}
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

        <Pressable onPress={handleSyncQueue} style={styles.syncPanel}>
          <Text style={styles.syncValue}>{offlineQueueCount}</Text>
          <Text style={styles.syncLabel}>ڕیزی Sync</Text>
        </Pressable>
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
});
