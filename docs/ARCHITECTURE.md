# Architektura — TwentyCRM_SM

## Schemat infrastruktury

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUKCJA (Hetzner)                   │
│                    *** NIE RUSZAĆ! ***                   │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Serwer 1 (App)  │    │  Serwer 2 (DB)   │          │
│  │  - Twenty CRM    │◄──►│  - PostgreSQL     │          │
│  │  - Worker         │    │                  │          │
│  │  - Redis          │    │                  │          │
│  │  - Nginx (proxy)  │    │                  │          │
│  └──────────────────┘    └──────────────────┘          │
│           │                        │                    │
│           └────────┬───────────────┘                    │
│                    ▼                                    │
│           ┌──────────────┐                              │
│           │ Hetzner      │                              │
│           │ Storage Box  │                              │
│           │ (backup)     │                              │
│           └──────────────┘                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               DEV (Hetzner VPS CX22)                    │
│           toniedevcrm.salesmasters.pl                   │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │  VPS all-in-one                     │               │
│  │  - Nginx (reverse proxy + SSL)      │  ◄── HTTPS   │
│  │  - Twenty CRM (Docker)              │               │
│  │  - Worker (Docker)                  │               │
│  │  - PostgreSQL (Docker)              │               │
│  │  - Redis (Docker)                   │               │
│  └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DEVELOPER (macOS)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   VSCode     │  │ Claude Code  │  │    Codex     │ │
│  │ + Remote SSH │  │              │  │   (OpenAI)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         └─────────┬───────┴──────────────────┘         │
│                   ▼                                     │
│          ┌──────────────┐                               │
│          │   GitHub     │                               │
│          │ (prywatne    │                               │
│          │  repo)       │                               │
│          └──────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

## Komponenty

### Twenty CRM (server)
Główna aplikacja CRM. Port: 3000 (wewnętrzny).

### Worker
Procesy w tle — emaile, synchronizacja, cron. Ten sam obraz Docker, inne polecenie.

### PostgreSQL 16
Baza danych. Port: 5432 (wewnętrzny, niedostępny z zewnątrz).

### Redis
Cache. Port: 6379 (wewnętrzny).

### Nginx
Reverse proxy + SSL. Przyjmuje HTTPS (443) i przekierowuje do Twenty (3000).

## Różnice DEV vs PROD

| Element | DEV | PROD |
|---------|-----|------|
| Baza danych | Lokalna (Docker) | Osobny serwer |
| SSL | Wildcard cert | Dedykowany cert |
| Backup | Ręczny | Automatyczny |
| Dane | Testowe | Produkcyjne |
