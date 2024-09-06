import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';

export enum SettingsPageTitles {
  Accounts = 'Conta - Configurações',
  Appearance = 'Aparência - Configurações',
  Profile = 'Perfil - Configurações',
  Objects = 'Modelo de Dados - Configurações',
  Members = 'Membros - Configurações',
  Developers = 'Desenvolvedores - Configurações',
  Integration = 'Integrações - Configurações',
  ServerlessFunctions = 'Funções - Configurações',
  General = 'Geral - Configurações',
  Default = 'Configurações',
}

enum SettingsPathPrefixes {
  Accounts = `${AppBasePath.Settings}/${SettingsPath.Accounts}`,
  Appearance = `${AppBasePath.Settings}/${SettingsPath.Appearance}`,
  Profile = `${AppBasePath.Settings}/${SettingsPath.ProfilePage}`,
  Objects = `${AppBasePath.Settings}/${SettingsPath.Objects}`,
  Members = `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`,
  Developers = `${AppBasePath.Settings}/${SettingsPath.Developers}`,
  ServerlessFunctions = `${AppBasePath.Settings}/${SettingsPath.ServerlessFunctions}`,
  Integration = `${AppBasePath.Settings}/${SettingsPath.Integrations}`,
  General = `${AppBasePath.Settings}/${SettingsPath.Workspace}`,
}

const getPathnameOrPrefix = (pathname: string) => {
  for (const prefix of Object.values(SettingsPathPrefixes)) {
    if (pathname.startsWith(prefix)) {
      return prefix;
    }
  }
  return pathname;
};

export const getPageTitleFromPath = (pathname: string): string => {
  const pathnameOrPrefix = getPathnameOrPrefix(pathname);
  switch (pathnameOrPrefix) {
    case AppPath.Verify:
      return 'Verificar';
    case AppPath.SignInUp:
      return 'Entrar ou Criar uma conta';
    case AppPath.Invite:
      return 'Convidar';
    case AppPath.CreateWorkspace:
      return 'Criar Workspace';
    case AppPath.CreateProfile:
      return 'Criar Perfil';
    case SettingsPathPrefixes.Appearance:
      return SettingsPageTitles.Appearance;
    case SettingsPathPrefixes.Accounts:
      return SettingsPageTitles.Accounts;
    case SettingsPathPrefixes.Profile:
      return SettingsPageTitles.Profile;
    case SettingsPathPrefixes.Members:
      return SettingsPageTitles.Members;
    case SettingsPathPrefixes.Objects:
      return SettingsPageTitles.Objects;
    case SettingsPathPrefixes.Developers:
      return SettingsPageTitles.Developers;
    case SettingsPathPrefixes.ServerlessFunctions:
      return SettingsPageTitles.ServerlessFunctions;
    case SettingsPathPrefixes.Integration:
      return SettingsPageTitles.Integration;
    case SettingsPathPrefixes.General:
      return SettingsPageTitles.General;
    default:
      return 'CRM - Digito Service';
  }
};
