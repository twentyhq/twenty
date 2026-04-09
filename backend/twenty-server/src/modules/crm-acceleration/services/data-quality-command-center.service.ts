import { Injectable } from '@nestjs/common';

interface GenericDataRecord {
  id: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

interface DataQualityRequest {
  records: GenericDataRecord[];
  requiredFields?: string[];
  staleAfterDays?: number;
}

export interface DuplicateGroup {
  key: string;
  recordIds: string[];
}

@Injectable()
export class DataQualityCommandCenterService {
  private normalize(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private normalizeName(value: string | null | undefined): string {
    return this.normalize(value).replace(/\s+/g, ' ');
  }

  private getDaysSince(dateText: string | null | undefined): number | null {
    if (!dateText) {
      return null;
    }

    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  private detectDuplicates(records: GenericDataRecord[]): DuplicateGroup[] {
    const duplicateMap = new Map<string, string[]>();

    for (const record of records) {
      const emailKey = this.normalize(record.email);
      const nameKey = this.normalizeName(record.name);
      const companyKey = this.normalize(record.company);

      const dedupKey =
        emailKey ||
        (nameKey && companyKey ? `name:${nameKey}|company:${companyKey}` : '');

      if (!dedupKey) {
        continue;
      }

      if (!duplicateMap.has(dedupKey)) {
        duplicateMap.set(dedupKey, []);
      }

      duplicateMap.get(dedupKey)?.push(record.id);
    }

    return Array.from(duplicateMap.entries())
      .filter(([, ids]) => ids.length > 1)
      .map(([key, recordIds]) => ({ key, recordIds }));
  }

  analyze(request: DataQualityRequest) {
    const requiredFields = request.requiredFields ?? ['name', 'email'];
    const staleAfterDays = request.staleAfterDays ?? 120;

    const duplicateGroups = this.detectDuplicates(request.records);

    const incompleteRecords = request.records
      .map((record) => {
        const missingFields = requiredFields.filter((fieldName) => {
          const value = record[fieldName];

          if (typeof value === 'string') {
            return value.trim().length === 0;
          }

          return value === null || value === undefined;
        });

        if (missingFields.length === 0) {
          return null;
        }

        return {
          recordId: record.id,
          missingFields,
        };
      })
      .filter((record): record is NonNullable<typeof record> => record !== null);

    const staleRecords = request.records
      .map((record) => {
        const daysSinceUpdate = this.getDaysSince(record.updatedAt);

        if (daysSinceUpdate === null || daysSinceUpdate < staleAfterDays) {
          return null;
        }

        return {
          recordId: record.id,
          daysSinceUpdate,
        };
      })
      .filter((record): record is NonNullable<typeof record> => record !== null);

    const totalRecords = request.records.length;
    const issueCount =
      duplicateGroups.length + incompleteRecords.length + staleRecords.length;
    const qualityScore =
      totalRecords === 0
        ? 100
        : Math.max(0, 100 - Math.round((issueCount / totalRecords) * 100));

    return {
      totalRecords,
      qualityScore,
      duplicates: {
        groups: duplicateGroups,
        recordsImpacted: duplicateGroups.reduce(
          (accumulator, group) => accumulator + group.recordIds.length,
          0,
        ),
      },
      incomplete: {
        requiredFields,
        records: incompleteRecords,
      },
      stale: {
        staleAfterDays,
        records: staleRecords,
      },
      suggestedBulkFixes: [
        'merge_duplicate_groups',
        'fill_required_fields',
        'refresh_stale_records',
      ],
    };
  }
}
