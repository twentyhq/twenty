#!/usr/bin/env node

const fs = require('fs');

const PERSON_SEEDS_FILE = './packages/twenty-server/src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant.ts';

console.log('Analyzing person data structure...');

const content = fs.readFileSync(PERSON_SEEDS_FILE, 'utf8');

// Extract the columns array
const columnsMatch = content.match(/PERSON_DATA_SEED_COLUMNS.*?=.*?\[(.*?)\]/s);
if (!columnsMatch) {
  console.log('Could not find columns definition');
  process.exit(1);
}

const columnsText = columnsMatch[1];
const columns = columnsText.split(',').map(col => col.trim().replace(/['"]/g, '')).filter(col => col.length > 0);
console.log('Expected columns:', columns.length, columns);

// Extract the data array - try a different approach
const dataStartIndex = content.indexOf('export const PERSON_DATA_SEED_DATA');
const dataEndIndex = content.indexOf('];', dataStartIndex);

if (dataStartIndex === -1 || dataEndIndex === -1) {
  console.log('Could not find data definition');
  process.exit(1);
}

const dataSection = content.substring(dataStartIndex, dataEndIndex + 2);
const dataMatch = dataSection.match(/\[(.*)\]/s);

if (!dataMatch) {
  console.log('Could not extract data array');
  process.exit(1);
}

const dataText = dataMatch[1];

// Split by record boundaries (looking for the pattern "}, {")
const records = dataText.split(/\},\s*\{/);
console.log('Found', records.length, 'records');

// Check each record
let inconsistentRecords = [];
for (let i = 0; i < records.length; i++) {
  let record = records[i];
  
  // Add back the braces if they were removed by split
  if (!record.trim().startsWith('{')) record = '{' + record;
  if (!record.trim().endsWith('}')) record = record + '}';
  
  // Count the number of key-value pairs in this record
  // Look for the pattern: key: value,
  const keyValuePairs = record.match(/\w+:/g);
  const fieldCount = keyValuePairs ? keyValuePairs.length : 0;
  
  if (fieldCount !== columns.length) {
    inconsistentRecords.push({
      index: i,
      expected: columns.length,
      actual: fieldCount,
      preview: record.substring(0, 200) + '...'
    });
  }
}

if (inconsistentRecords.length > 0) {
  console.log('\nFound', inconsistentRecords.length, 'inconsistent records:');
  inconsistentRecords.forEach(record => {
    console.log(`Record ${record.index}: expected ${record.expected} fields, found ${record.actual}`);
    console.log('Preview:', record.preview);
    console.log('---');
  });
} else {
  console.log('\nAll records have consistent field counts!');
}

console.log('Analysis complete.');