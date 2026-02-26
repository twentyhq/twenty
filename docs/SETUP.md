# Setup — Jak postawić środowisko DEV od zera

Ten dokument opisuje krok po kroku jak odtworzyć środowisko DEV.

## Wymagania

- VPS: min. 2 vCPU, 4GB RAM (Hetzner CX22 lub większy)
- System: Ubuntu 24.04 LTS
- Domena z rekordem DNS A wskazującym na IP VPS-a
- Certyfikat SSL (wildcard lub dla konkretnej subdomeny)

## Krok 1: Przygotowanie serwera

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y git
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
corepack enable
```

## Krok 2: Użytkownik (nie pracuj jako root!)

```bash
adduser kontakt
usermod -aG sudo kontakt
usermod -aG docker kontakt
mkdir -p /home/kontakt/.ssh
cp /root/.ssh/authorized_keys /home/kontakt/.ssh/
chown -R kontakt:kontakt /home/kontakt/.ssh
chmod 700 /home/kontakt/.ssh
chmod 600 /home/kontakt/.ssh/authorized_keys
```

## Krok 3: Firewall + Fail2ban

```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 3000/tcp
sudo ufw enable
sudo apt install -y fail2ban
sudo systemctl enable fail2ban && sudo systemctl start fail2ban
```

## Krok 4: Klonowanie i konfiguracja

```bash
cd ~
git clone https://github.com/pawelpmcc/TwentyCRM_SM.git
cd TwentyCRM_SM
cp .env.example .env
openssl rand -base64 32    # wstaw wynik jako APP_SECRET w .env
nano .env                  # uzupełnij hasła i SERVER_URL
```

## Krok 5: Uruchomienie

```bash
docker compose up -d
docker compose ps
curl http://localhost:3000/healthz
```

## Krok 6: Nginx + SSL

Zainstaluj Nginx i skonfiguruj reverse proxy z certyfikatem SSL.
Szczegóły w docs/ARCHITECTURE.md.
