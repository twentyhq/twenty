const fs = require('fs');

const filePath = './field-metadata-create-collection.json';

function checkUniqueKeys(data) {
  const uniqueKeys = new Set();
  const violations = [];

  data.forEach((item) => {
    const key = `${item.name}-${item.workspaceId}-${item.objectMetadataId}`;

    if (uniqueKeys.has(key)) {
      violations.push(key);
    } else {
      uniqueKeys.add(key);
    }
  });

  return violations;
}

fs.readFile(filePath, (err, data) => {
  if (err) throw err;

  const jsonData = JSON.parse(data);
  const violations = checkUniqueKeys(jsonData);

  if (violations.length > 0) {
    console.log(
      'Uniqueness violations found for the following keys:',
      violations,
    );
  } else {
    console.log('No uniqueness violations found.');
  }
});
