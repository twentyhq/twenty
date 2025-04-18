import { readdirSync } from 'fs';
import { join } from 'path';

import { SemVer } from 'semver';

/**
 * Extracts the version number from a directory name
 * Example: "0-51" -> "0.51.0"
 */
export const extractVersionFromDirName = (dirName: string): string | null => {
  const match = dirName.match(/^(\d+)-(\d+)$/);

  if (!match) {
    return null;
  }

  const [, major, minor] = match;

  return `${major}.${minor}.0`;
};

/**
 * Structure for describing a version upgrade path
 */
export interface VersionPath {
  baseVersion: string;
  targetVersion: string;
}

/**
 * Sorts versions in ascending order
 */
const sortVersions = (versions: string[]): string[] => {
  return versions
    .map((version) => new SemVer(version))
    .sort((a, b) => a.compare(b))
    .map((semver) => semver.version);
};

/**
 * Discovers all available version paths from the directory structure
 */
export const discoverVersionPaths = (): VersionPath[] => {
  // Get the base directory for version commands
  const baseDir = join(__dirname);

  // Read directory contents and filter for version directories (0-XX format)
  const versionDirs = readdirSync(baseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && /^\d+-\d+$/.test(dirent.name))
    .map((dirent) => dirent.name);

  // Extract and sort version numbers
  const versions = versionDirs
    .map((dirName) => extractVersionFromDirName(dirName))
    .filter((version): version is string => version !== null);

  const sortedVersions = sortVersions(versions);

  // Create version paths by connecting each version to the next
  const paths: VersionPath[] = [];

  for (let i = 0; i < sortedVersions.length - 1; i++) {
    const currentVersion = sortedVersions[i];
    const nextVersion = sortedVersions[i + 1];

    paths.push({
      baseVersion: currentVersion,
      targetVersion: nextVersion,
    });
  }

  return paths;
};

/**
 * Gets the directory name for a specific version
 * Example: "0.51.0" -> "0-51"
 */
export const getVersionDirName = (version: string): string | null => {
  try {
    const semver = new SemVer(version);

    return `${semver.major}-${semver.minor}`;
  } catch (error) {
    return null;
  }
};
