#!/usr/bin/env node

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';

interface ApplicationManifest {
  universalIdentifier: string;
  label: string;
  description?: string;
  icon?: string;
  version: string;
  repositoryUrl?: string;
  roles?: any[];
  objects?: any[];
  functions?: any[];
  agents?: any[];
  views?: any[];
  pageLayouts?: any[];
}

// JSON Schema for Twenty application manifests
export const applicationSchema = {
  type: 'object',
  required: ['universalIdentifier', 'label', 'version'],
  properties: {
    universalIdentifier: {
      type: 'string',
      pattern: '^[a-z0-9]+([.-][a-z0-9]+)*\\.[a-z0-9]+([.-][a-z0-9]+)*$',
      description: 'Reverse domain notation identifier (e.g., com.company.app-name)'
    },
    label: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'Human-readable application name'
    },
    description: {
      type: 'string',
      maxLength: 500,
      description: 'Brief description of the application'
    },
    icon: {
      type: 'string',
      maxLength: 10,
      description: 'Emoji or short icon representation'
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.-]+)?$',
      description: 'Semantic version (e.g., 1.0.0)'
    },
    repositoryUrl: {
      type: 'string',
      format: 'uri',
      description: 'Git repository URL'
    },
    roles: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'label'],
        properties: {
          universalIdentifier: { type: 'string' },
          label: { type: 'string' },
          description: { type: 'string' },
          permissions: {
            type: 'object',
            properties: {
              canUpdateAllSettings: { type: 'boolean' },
              canAccessAllTools: { type: 'boolean' },
              canReadAllObjectRecords: { type: 'boolean' },
              canUpdateAllObjectRecords: { type: 'boolean' },
              canSoftDeleteAllObjectRecords: { type: 'boolean' },
              canDestroyAllObjectRecords: { type: 'boolean' }
            }
          }
        }
      }
    },
    objects: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'nameSingular', 'namePlural', 'labelSingular', 'labelPlural'],
        properties: {
          universalIdentifier: { type: 'string' },
          nameSingular: { type: 'string' },
          namePlural: { type: 'string' },
          labelSingular: { type: 'string' },
          labelPlural: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              required: ['universalIdentifier', 'name', 'label', 'type'],
              properties: {
                universalIdentifier: { type: 'string' },
                name: { type: 'string' },
                label: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                isNullable: { type: 'boolean' },
                defaultValue: {},
                options: {}
              }
            }
          },
          indexes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['universalIdentifier', 'name', 'fields'],
              properties: {
                universalIdentifier: { type: 'string' },
                name: { type: 'string' },
                fields: {
                  type: 'array',
                  items: { type: 'string' }
                },
                isUnique: { type: 'boolean' },
                indexType: { type: 'string' }
              }
            }
          }
        }
      }
    },
    functions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'name', 'sourceCode'],
        properties: {
          universalIdentifier: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          sourceCode: { type: 'string' },
          runtime: { type: 'string' },
          timeoutSeconds: { type: 'number' },
          triggers: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'settings'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['cron', 'databaseEvent']
                },
                settings: { type: 'object' }
              }
            }
          }
        }
      }
    },
    agents: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'name', 'label', 'prompt'],
        properties: {
          universalIdentifier: { type: 'string' },
          name: { type: 'string' },
          label: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          prompt: { type: 'string' },
          modelId: { type: 'string' },
          responseFormat: { type: 'object' }
        }
      }
    },
    views: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'name', 'objectName', 'type', 'icon'],
        properties: {
          universalIdentifier: { type: 'string' },
          name: { type: 'string' },
          objectName: { type: 'string' },
          type: {
            type: 'string',
            enum: ['TABLE', 'KANBAN']
          },
          icon: { type: 'string' },
          filters: { type: 'array' },
          sorts: { type: 'array' },
          fields: { type: 'array' }
        }
      }
    },
    pageLayouts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['universalIdentifier', 'name', 'type', 'tabs'],
        properties: {
          universalIdentifier: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          objectName: { type: 'string' },
          tabs: {
            type: 'array',
            items: {
              type: 'object',
              required: ['universalIdentifier', 'name', 'position', 'widgets'],
              properties: {
                universalIdentifier: { type: 'string' },
                name: { type: 'string' },
                position: { type: 'number' },
                widgets: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['universalIdentifier', 'type', 'position', 'settings'],
                    properties: {
                      universalIdentifier: { type: 'string' },
                      type: { type: 'string' },
                      position: { type: 'number' },
                      settings: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  additionalProperties: false
} as const;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ApplicationStats {
  totalApps: number;
  validApps: number;
  invalidApps: number;
  totalComponents: {
    roles: number;
    objects: number;
    functions: number;
    agents: number;
    views: number;
    pageLayouts: number;
  };
}

export async function validateApplications(): Promise<void> {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(applicationSchema);

  // eslint-disable-next-line no-console
  console.log('🔍 Validating Twenty applications...\n');

  // Find all twenty-app.json files
  const manifestFiles = await glob('**/twenty-app.json', {
    cwd: process.cwd(),
    ignore: ['node_modules/**', 'dist/**', '.git/**']
  });

  if (manifestFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.log('⚠️  No application manifests found');
    return;
  }

  const stats: ApplicationStats = {
    totalApps: 0,
    validApps: 0,
    invalidApps: 0,
    totalComponents: {
      roles: 0,
      objects: 0,
      functions: 0,
      agents: 0,
      views: 0,
      pageLayouts: 0
    }
  };

  const validationResults: Array<{ file: string; result: ValidationResult }> = [];

  for (const manifestFile of manifestFiles) {
    const appName = path.dirname(manifestFile);
    // eslint-disable-next-line no-console
    console.log(`📦 Validating ${appName}...`);

    try {
      const manifestContent = fs.readFileSync(manifestFile, 'utf-8');
      const manifest: ApplicationManifest = JSON.parse(manifestContent);

      const isValid = validate(manifest);
      const errors: string[] = [];

      if (!isValid && validate.errors) {
        for (const error of validate.errors) {
          const errorPath = error.instancePath || 'root';
          const errorMessage = error.message || 'Unknown error';
          errors.push(`${errorPath}: ${errorMessage}`);
        }
      }

      const result: ValidationResult = { isValid, errors };
      validationResults.push({ file: manifestFile, result });

      if (isValid) {
        // eslint-disable-next-line no-console
        console.log('   ✅ Valid application');
        stats.validApps++;

        // Count components
        if (manifest.roles) stats.totalComponents.roles += manifest.roles.length;
        if (manifest.objects) stats.totalComponents.objects += manifest.objects.length;
        if (manifest.functions) stats.totalComponents.functions += manifest.functions.length;
        if (manifest.agents) stats.totalComponents.agents += manifest.agents.length;
        if (manifest.views) stats.totalComponents.views += manifest.views.length;
        if (manifest.pageLayouts) stats.totalComponents.pageLayouts += manifest.pageLayouts.length;
      } else {
        // eslint-disable-next-line no-console
        console.log('   ❌ Invalid application');
        for (const error of errors) {
          // eslint-disable-next-line no-console
          console.log(`      • ${error}`);
        }
        stats.invalidApps++;
      }

      stats.totalApps++;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log(`   ❌ Failed to parse manifest: ${error.message}`);
      validationResults.push({
        file: manifestFile,
        result: { isValid: false, errors: [`Parse error: ${error.message}`] }
      });
      stats.invalidApps++;
      stats.totalApps++;
    }
  }

  // Print summary
  // eslint-disable-next-line no-console
  console.log('\n📊 Validation Summary:');
  // eslint-disable-next-line no-console
  console.log(`   ✅ Valid applications: ${stats.validApps}`);
  // eslint-disable-next-line no-console
  console.log(`   ❌ Invalid applications: ${stats.invalidApps}`);
  // eslint-disable-next-line no-console
  console.log(`   📦 Total applications: ${stats.totalApps}`);

  if (stats.validApps > 0) {
    // eslint-disable-next-line no-console
    console.log('\n🧩 Component Summary:');
    // eslint-disable-next-line no-console
    console.log(`   👥 Roles: ${stats.totalComponents.roles}`);
    // eslint-disable-next-line no-console
    console.log(`   📋 Objects: ${stats.totalComponents.objects}`);
    // eslint-disable-next-line no-console
    console.log(`   ⚡ Functions: ${stats.totalComponents.functions}`);
    // eslint-disable-next-line no-console
    console.log(`   🤖 Agents: ${stats.totalComponents.agents}`);
    // eslint-disable-next-line no-console
    console.log(`   👁️  Views: ${stats.totalComponents.views}`);
    // eslint-disable-next-line no-console
    console.log(`   📄 Page Layouts: ${stats.totalComponents.pageLayouts}`);
  }

  if (stats.invalidApps === 0) {
    // eslint-disable-next-line no-console
    console.log('\n🎉 All applications are valid!');
  } else {
    // eslint-disable-next-line no-console
    console.log('\n⚠️  Some applications have validation errors. Please fix them before proceeding.');
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateApplications().catch(error => {
    // eslint-disable-next-line no-console
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  });
}
